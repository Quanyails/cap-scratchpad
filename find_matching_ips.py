import sys
import time
from collections import defaultdict

from selenium.common.exceptions import NoSuchElementException

TIMEOUT = 60 * 60  # seconds

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.expected_conditions import presence_of_element_located, element_to_be_clickable, \
    staleness_of, visibility_of, visibility_of_element_located, visibility_of_any_elements_located, \
    invisibility_of_element_located
from selenium.webdriver.support.wait import WebDriverWait


def check_matching_ips(username, password, url):
    """

    :param str username: Your Smogon account username or email.
    :param str password: Your Smogon account password.
    :param str url: The url of the poll
        E.g., ['https://www.smogon.com/forums/threads/cap-25-part-6-cap-25w-art-poll-1.3641805/']
    :rtype: None
    """

    # Safari's webdriver is the easiest to set up, but you can change this line.
    # Safari webdriver is broken?
    # driver = webdriver.Safari()
    driver = webdriver.Chrome() # requires brew tap homebrew/cask -> brew cask install chromedriver
    driver.maximize_window()

    def login(username, password):
        driver.get('https://www.smogon.com/forums/login/')
        username_input = driver.find_element_by_name('login')
        username_input.send_keys(username)
        password_input = driver.find_element_by_name('password')
        password_input.send_keys(password)
        # Not sure why form.submit doesn't work...
        WebDriverWait(driver, TIMEOUT).until(element_to_be_clickable((By.CSS_SELECTOR, '.button--icon--login')))
        driver.find_element_by_css_selector('.button--icon--login').click()
        WebDriverWait(driver, TIMEOUT).until(presence_of_element_located((By.CSS_SELECTOR, '.p-navgroup-link--user')))


    def get_ips_in_container_element(element):
        ip_to_users_map = defaultdict(set)

        page_messages = element.find_elements(By.CSS_SELECTOR, '.message')
        for message in page_messages:
            # Any @<username> in a message also has class .username, so we specify.
            name_field = message.find_element(By.CSS_SELECTOR, '.message-name .username')
            # Use innerText instead of name_field.text because Chrome Webdriver sometimes returns an empty string.
            # See: https://stackoverflow.com/questions/20888592/
            # name = name_field.text
            name = name_field.get_attribute('textContent')
            print name
            try:
                ip_button = message.find_element(By.CSS_SELECTOR, '.actionBar-action--ip')
                time.sleep(0.5)  # I don't know why this is needed. :|
                ip_button.click()
            except NoSuchElementException as e:
                # We can't see IPs of deleted posts.
                continue

            # Xenforo generates a new .overlay every time and hides it,
            # so the wait will automatically finish
            # if we use presence_of_element_located,
            # as it detects the last, hidden locator.

            # WebDriverWait(driver, TIMEOUT).until(visibility_of_any_elements_located((By.CSS_SELECTOR, '.is-active')))
            WebDriverWait(driver, TIMEOUT).until(visibility_of_element_located((By.CSS_SELECTOR, '.overlay-container.is-active')))
            overlay = driver.find_element(By.CSS_SELECTOR, '.overlay-container.is-active')
            WebDriverWait(driver, TIMEOUT).until(visibility_of(overlay))
            assert overlay.is_displayed()
            ip_fields = overlay.find_elements(By.CSS_SELECTOR, '.ip')
            for ip_field in ip_fields:
                ip = ip_field.text
                ip_to_users_map[ip].add(name)

            # WebDriverWait(driver, TIMEOUT).until(visibility_of_element_located((By.CSS_SELECTOR, '.overlay-titleCloser')))
            close_button = overlay.find_element_by_css_selector('.overlay-titleCloser')
            close_button.click()
            WebDriverWait(driver, TIMEOUT).until(invisibility_of_element_located((By.ID, overlay.id)))

        return ip_to_users_map

    def get_ips_on_page(url):
        # https://stackoverflow.com/a/1731989

        ip_to_users_map = defaultdict(set)

        driver.get(url)

        # A `while` loop is the cleanest for scanning over a page and finding the 'next' button.
        while True:
            WebDriverWait(driver, 10).until(visibility_of_element_located((By.CSS_SELECTOR, '.block--messages')))
            message_container = driver.find_element(By.CSS_SELECTOR, '.block--messages')
            ip_to_user_map_section = get_ips_in_container_element(message_container)

            for (key, values) in ip_to_user_map_section.iteritems():
                ip_to_users_map[key].update(values)

            try:
                body = driver.find_element_by_tag_name('body')
                next_button = body.find_element(By.CSS_SELECTOR, '.pageNav-jump--next')
                # next_button.click() fails for some reason...
                next_url = next_button.get_property('href')
                driver.get(next_url)
                WebDriverWait(driver, 10).until(staleness_of(body))
            except NoSuchElementException as e:
                # No button found, finish iteration
                break

        return ip_to_users_map

    login(username, password)
    ip_to_user_map = get_ips_on_page(url)

    for (key, values) in ip_to_user_map.iteritems():
        print 'IP address', key, 'username(s)', values
    for (key, values) in ip_to_user_map.iteritems():
        if len(values) > 1:
            print 'MULTIPLE USERS', values

    driver.quit()


if __name__ == '__main__':
    args = sys.argv
    username = args[1]
    password = args[2]
    url = args[3]

    try:
        check_matching_ips(username,
                           password,
                           url)
    except Exception as e:
        print e
        print e.message
        import traceback
        traceback.print_stack()