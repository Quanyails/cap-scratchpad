from datetime import datetime
from typing import NamedTuple, List

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

_TIMEOUT = 10


class ForumDatum(NamedTuple):
    end_timestamp: int
    start_timestamp: int
    title: str
    url: str


class CapThread():
    _PAGE_NAV_LOCATOR = (By.CSS_SELECTOR, ".pageNav-main")
    _POST_TIME_LOCATOR = (By.CSS_SELECTOR, ".message .message-attribution-main [data-time]")
    _START_TIME_LOCATOR = (By.CSS_SELECTOR, ".p-description [data-time]")
    _TITLE_LOCATOR = (By.CSS_SELECTOR, ".p-title-value")

    def __init__(self, driver: WebDriver):
        self._driver = driver

    def get_datum(self, url: str) -> ForumDatum:
        self._driver.get(url)

        # Wait for page to load
        WebDriverWait(self._driver, _TIMEOUT).until(
            EC.presence_of_element_located(self._TITLE_LOCATOR)
        )

        title_el = self._driver.find_element(*self._TITLE_LOCATOR)
        title = title_el.get_attribute("innerText")

        start_time_el = self._driver.find_element(*self._START_TIME_LOCATOR)
        start_timestamp = int(start_time_el.get_attribute("data-time"))

        # Find last page
        try:
            pagenav_el = self._driver.find_element(*self._PAGE_NAV_LOCATOR)
            page_els = pagenav_el.find_elements(By.CSS_SELECTOR, "a")
            last_page_url = page_els[-1].get_attribute("href")
        except NoSuchElementException:
            # Thread is one page long, so stay on same page
            last_page_url = None

        if last_page_url is not None:
            self._driver.get(last_page_url)
            WebDriverWait(self._driver, _TIMEOUT).until(
                EC.presence_of_element_located(self._TITLE_LOCATOR)
            )

        # Get timestamp of element on last page
        message_time_els = self._driver.find_elements(*self._POST_TIME_LOCATOR)
        # NOTE: There's a bug where messages are shown out of order, so it's
        # possible that the last message_el may not have the most recent ts.
        # Ignore this for now.
        end_timestamp = int(message_time_els[-1].get_attribute("data-time"))

        return ForumDatum(
            end_timestamp=end_timestamp,
            start_timestamp=start_timestamp,
            title=title,
            url=url,
        )


def format_data(data: List[ForumDatum]) -> str:
    rows = []
    for datum in data:
        start_dt = datetime.fromtimestamp(datum.start_timestamp)
        end_dt = datetime.fromtimestamp(datum.end_timestamp)

        delta = end_dt.toordinal() - start_dt.toordinal()

        entries = [
            f'[URL="{datum.url}"]{datum.title}[/URL]',
            start_dt.isoformat()[:10],
            end_dt.isoformat()[:10],
            f"{delta} day" if delta == 1 else f"{delta} days",
        ]
        cells = [f"[TD]{entry}[/TD]" for entry in entries]
        joined_cells = "".join(cells)
        row = f"[TR]{joined_cells}[/TR]"
        rows.append(row)

    joined_rows = "\n".join(rows)
    return f"""
[TABLE]
{joined_rows}
[/TABLE]
""".strip()


if __name__ == "__main__":
    # Pair this script with this JS script for getting the list of URLs:
    # Array.from(document.querySelectorAll("[data-preview-url]")).map(el => el.href).reverse().join("\n")
    urls = """
https://www.smogon.com/forums/threads/cap-23-tl-and-tlt-nominations.3609763/
https://www.smogon.com/forums/threads/cap-23-topic-leader-poll.3610528/
https://www.smogon.com/forums/threads/cap-23-topic-leadership-team-poll.3610743/
https://www.smogon.com/forums/threads/cap-23-part-1-concept-submissions.3610914/
https://www.smogon.com/forums/threads/cap-23-part-1-concept-poll-1.3611509/
https://www.smogon.com/forums/threads/cap-23-part-1-concept-poll-2.3611622/
https://www.smogon.com/forums/threads/cap-23-part-1-concept-assessment.3611768/
https://www.smogon.com/forums/threads/cap-23-part-2-typing-discussion.3612287/
https://www.smogon.com/forums/threads/cap-23-part-2-typing-poll.3612975/
https://www.smogon.com/forums/threads/cap-23-part-2-typing-poll-2.3613025/
https://www.smogon.com/forums/threads/cap-23-part-3-threats-discussion.3613075/
https://www.smogon.com/forums/threads/cap-23-part-4-primary-ability-discussion.3613885/
https://www.smogon.com/forums/threads/cap-23-part-4-primary-ability-poll-1.3614353/
https://www.smogon.com/forums/threads/cap-23-part-4-primary-ability-poll-2.3614479/
https://www.smogon.com/forums/threads/cap-23-part-5-stat-spread-submissions.3614868/
https://www.smogon.com/forums/threads/cap-23-part-5-stat-spread-poll-1.3615793/
https://www.smogon.com/forums/threads/cap-23-part-5-stat-spread-poll-2.3615905/
https://www.smogon.com/forums/threads/cap-23-part-6-secondary-ability-discussion.3615981/
https://www.smogon.com/forums/threads/cap-23-part-6-secondary-ability-poll.3617318/
https://www.smogon.com/forums/threads/cap-23-art-submissions.3613136/
https://www.smogon.com/forums/threads/cap-23-part-7-art-poll-1.3617616/
https://www.smogon.com/forums/threads/cap-23-part-7-art-poll-2.3617805/
https://www.smogon.com/forums/threads/cap23-part-7-art-poll-3.3617903/
https://www.smogon.com/forums/threads/cap-23-part-7-art-poll-4.3618017/
https://www.smogon.com/forums/threads/cap-23-part-9-name-submissions.3618175/
https://www.smogon.com/forums/threads/cap-23-name-poll-1.3619183/
https://www.smogon.com/forums/threads/cap-23-name-poll-2.3619254/
https://www.smogon.com/forums/threads/cap-23-name-poll-3.3619390/
https://www.smogon.com/forums/threads/cap-23-part-8-moveset-discussion.3618018/
https://www.smogon.com/forums/threads/cap-23-full-movepool-submissions.3619746/
https://www.smogon.com/forums/threads/cap-23-movepool-poll-1.3621041/
https://www.smogon.com/forums/threads/cap23-movepool-poll-2.3621227/
https://www.smogon.com/forums/threads/cap-23-part-10-sprite-submissions.3618174/
https://www.smogon.com/forums/threads/cap-23-part-10-sprite-poll.3621655/
https://www.smogon.com/forums/threads/cap-23-part-12-flavor-ability-discussion.3621529/
https://www.smogon.com/forums/threads/cap-23-flavor-ability-poll-1.3621918/
https://www.smogon.com/forums/threads/cap-23-part-13-pokedex-submissions.3622285/
https://www.smogon.com/forums/threads/cap-23-final-product.3621906/
https://www.smogon.com/forums/threads/cap-23-part-13-pokedex-poll-1.3624533/
https://www.smogon.com/forums/threads/cap-23-part-13-pokedex-poll-2.3624593/
""".strip().split("\n")

    driver = webdriver.Chrome(
        executable_path="node_modules/.bin/chromedriver",
    )
    driver.maximize_window()

    cap_thread = CapThread(driver)
    data = [cap_thread.get_datum(url) for url in urls]
    driver.quit()

    table = format_data(data)
    print(table)
