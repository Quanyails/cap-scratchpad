import datetime
import math
from io import BytesIO

import requests
# Image Related
from PIL import Image, ImageDraw, ImageFont
# Parsing HTML
from bs4 import BeautifulSoup
# HTTP related
from requests.exceptions import RequestException


# imgur
import pyimgur

# Modified using paintseagull's counter.py as a base


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.content

    except RequestException as e:
        log_error("Error during requests to {0} : {1}".format(url, str(e)))
        return None


def log_error(e):
    """
    It is always a good idea to log errors.
    This function just prints them, but you can
    make it do anything.
    """
    print(e)


def get_pagecount(base_url):
    # Count how many pages there are
    pagecount = 1
    stop = True
    while stop:

        myPage = base_url
        if pagecount > 1:
            myPage += "page-" + str(pagecount)

        myURL = requests.get(myPage, allow_redirects=False)

        # Check if page exists
        if myURL.status_code == 200:
            print(myPage + " exists! Continuing...")
            pagecount += 1
        else:
            print(myPage + " does not exist, so stopping...")
            pagecount -= 1
            stop = False
    return pagecount


def get_posts(base_url):
    pagecount = get_pagecount(base_url)
    posts = []

    # Iterate through pages
    for i in range(1, pagecount + 1):

        # Skip First 2 Posts if first page
        if i == 1:
            raw_html = simple_get(base_url)
            start_ind = 2
            print(len(raw_html))
        else:
            raw_html = simple_get(base_url + "page-" + str(i))
            start_ind = 0
            print(len(raw_html))

        # Grab Post Contents
        soup = BeautifulSoup(raw_html, "html.parser")

        posts.extend(soup.select(".message--post")[start_ind::])
    return posts


def normalize_image_url(image):
    src = image["src"]
    if src.startswith("https://"):
        return src
    elif src.startswith("//"):
        return "https:" + src
    else:
        return "https://smogon.com" + src


def jsonify_post(post):
    name = post["data-author"]
    images = post.select(".bbImage")
    text = post.select(".bbWrapper")
    image = normalize_image_url(images[0]) if images else None
    is_final_submission = text and text[0].text \
        .strip().lower().startswith("final submission")

    return {
        "name": name,
        "image": image,
        "status": "Final Submission" if is_final_submission else "WIP"
    }


def filter_posts_without_images(posts_json):
    return [post_json for post_json in posts_json if post_json["image"]]


def deduplicate_by_last_post(post_json):
    seen = set()
    deduplicated = []
    for post_json in reversed(post_json):
        name = post_json["name"]
        if name not in seen:
            seen.add(name)
            deduplicated.append(post_json)
    return deduplicated


def sort_by_name(post_json):
    return sorted(post_json, key=lambda post: post["name"].lower())


def get_posts_json(base_url):
    posts = get_posts(base_url)
    posts_json = [jsonify_post(post) for post in posts]
    post_json_with_images = filter_posts_without_images(posts_json)
    deduplicated_post_json = deduplicate_by_last_post(post_json_with_images)
    sorted_post_json = sort_by_name(deduplicated_post_json)
    return sorted_post_json


cellSize = 250
maxCellsAcross = 6
topBuffer = 50


def get_2d_index(i):
    x = i % maxCellsAcross
    y = math.floor(i / maxCellsAcross)
    # y = int(math.floor(i / maxCellsAcross))   # Python 2 adapter
    return x, y


def get_coordinates(i):
    x, y = get_2d_index(i)
    canvas_x = x * cellSize
    canvas_y = y * (cellSize + topBuffer)
    return canvas_x, canvas_y


def create_collage(posts_json, image_filename="collage.png"):
    # Create Collage
    cWidth = cellSize * maxCellsAcross
    rows = math.ceil(len(posts_json) / maxCellsAcross)
    # rows = int(math.ceil(len(posts_json) / maxCellsAcross))  # Python 2 adapter
    cHeight = (rows * cellSize) + (rows * topBuffer)
    collage = Image.new("RGB", (cWidth, cHeight), (255, 255, 255))
    draw = ImageDraw.Draw(collage)
    font = ImageFont.truetype("Arial.ttf", 16)
    # font = None  # Adapter
    print("Collage Size: " + str(cWidth) + " / " + str(cHeight))

    # Paste Images in
    for i, post_json in enumerate(posts_json):
        name = post_json["name"]
        image = post_json["image"]
        status = post_json["status"]
        myX, myY = get_coordinates(i)
        print()
        print("Reading " + image + "...")
        response = requests.get(image)
        img = Image.open(BytesIO(response.content))

        # Thumbnail and adjust offsets
        img.thumbnail((cellSize, cellSize))
        (imgWidth, imgHeight) = img.size
        xOff = math.floor(myX + ((cellSize - imgWidth) / 2))
        yOff = math.floor(myY + ((cellSize - imgHeight) / 2))
        # xOff = int(math.floor(myX + ((cellSize - imgWidth) / 2)))  # Python 2 adapter
        # yOff = int(math.floor(myY + ((cellSize - imgHeight) / 2)))  # Python 2 adapter

        print("Pasting at " + str(xOff) + " / " + str(yOff))

        # Paste if Alpha is good
        try:
            collage.paste(img, (xOff, yOff), img)
        except ValueError:
            collage.paste(img, (xOff, yOff))

        # Draw Name / Progress
        w, h = draw.textsize(name)
        tx = myX + ((cellSize - w) / 2)
        ty = myY + cellSize + 2
        draw.text((tx, ty), name, fill="black", font=font)

        # Draw WIP/final status
        w, h = draw.textsize(status)
        tx = myX + ((cellSize - w) / 2)
        ty = myY + cellSize + 2 + (h * 2)
        draw.text((tx, ty), status, fill="black", font=font)

    collage.save(image_filename)


def upload_to_imgur(imgur_client, image_filename):
    date = datetime.datetime.today()
    uploaded = imgur_client.upload_image(image_filename, title="CAP Collage " + date.strftime("%d-%B-%Y %H:%M:%S"))
    return uploaded.link


def make_bbcode(posts_json, imgurLink, filename="post.txt"):
    myPaste = ""
    for post_json in posts_json:
        myName = "[b]" + post_json["name"] + "[/b]"
        myPost = "[hide][img]" + post_json["image"] + "[/img][/hide]"
        myPaste += myName + "\n" + myPost + "\n"

    # Finalize Post
    myDisclaimer = open("disclaimer.txt", "r").read()
    collageLink = "Collage Link: " + imgurLink + "\n\n"
    myPaste = myDisclaimer + "\n\n" + collageLink + myPaste

    with open(filename, "w+") as myFile:
        myFile.write(myPaste)


if __name__ == "__main__":
    print("Paste first page of Art Thread:")
    base_url = "https://www.smogon.com/forums/threads/cap-26-art-submissions.3648463/"  # input("");

    try:
        posts_json = get_posts_json(base_url)
        image_filename = create_collage(posts_json)
        print("Saved collage.png")

        # Ask if to create Collage
        print("Upload Collage to imgur? (y/n)")
        canCollage = input().lower()

        # Upload to imgur
        if canCollage == "y":
            CLIENT_ID = "_IMGUR_CLIENT_ID_"
            CLIENT_SECRET = "_IMGUR_CLIENT_SECRET_"
            im = 0
            imgur_client = pyimgur.Imgur(CLIENT_ID)
            imgur_client = None
            print("Logged in using CLIENT_ID")
            collageLink = upload_to_imgur(imgur_client, image_filename)
            print("Uploaded to imgur: " + collageLink)
            make_bbcode(posts_json, collageLink)
            print("Successfully saved post.txt!")
        print("Total Entries: " + str(len(posts_json)))

    except Exception as e:
        print(e)
        print(e.message)
        import traceback

        traceback.print_stack()
