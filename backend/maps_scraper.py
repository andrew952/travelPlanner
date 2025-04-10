import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
from geopy.geocoders import Nominatim

class MapsScraper:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="travel_planner")
        self.driver = None

    def setup_driver(self):
        """Initialize Selenium WebDriver"""
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(options=options)

    def get_location_coordinates(self, address):
        """Get latitude and longitude for a given address"""
        try:
            location = self.geolocator.geocode(address)
            if location:
                return location.latitude, location.longitude
            return None, None
        except Exception as e:
            print(f"Error getting coordinates: {e}")
            return None, None

    def get_place_details(self, place_name, address):
        """Fetch place details from Google Maps"""
        if not self.driver:
            self.setup_driver()

        try:
            # Construct search query
            search_query = f"{place_name} {address}"
            search_query = search_query.replace(' ', '+')
            url = f"https://www.google.com/maps/search/?api=1&query={search_query}"
            
            self.driver.get(url)
            time.sleep(2)  # Wait for page to load

            # Extract rating
            rating = None
            try:
                rating_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.gm2-display-2"))
                )
                rating = float(rating_element.text)
            except:
                pass

            # Extract opening hours
            opening_hours = None
            try:
                hours_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='opening-hours']"))
                )
                opening_hours = hours_element.text
            except:
                pass

            return {
                'rating': rating,
                'opening_hours': opening_hours
            }

        except Exception as e:
            print(f"Error scraping place details: {e}")
            return None

    def get_travel_time(self, origin_address, destination_address, transport_type='driving'):
        """Get estimated travel time between two locations"""
        if not self.driver:
            self.setup_driver()

        try:
            # Construct directions URL
            origin = origin_address.replace(' ', '+')
            destination = destination_address.replace(' ', '+')
            url = f"https://www.google.com/maps/dir/{origin}/{destination}/"
            
            self.driver.get(url)
            time.sleep(2)  # Wait for page to load

            # Extract travel time
            travel_time = None
            try:
                time_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='duration']"))
                )
                travel_time = time_element.text
            except:
                pass

            return {
                'estimated_travel_time': travel_time
            }

        except Exception as e:
            print(f"Error getting travel time: {e}")
            return None

    def close(self):
        """Close the WebDriver"""
        if self.driver:
            self.driver.quit()
            self.driver = None 