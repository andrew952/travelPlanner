import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
from geopy.geocoders import Nominatim
from datetime import datetime, timedelta
import logging
from typing import Dict, Optional, Tuple
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MapsScraper:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="travel_planner")
        self.driver = None
        self.cache_duration = timedelta(hours=1)

    def setup_driver(self):
        """Initialize Selenium WebDriver with additional options for better performance"""
        if not self.driver:
            options = webdriver.ChromeOptions()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-notifications')
            options.add_argument('--disable-extensions')
            self.driver = webdriver.Chrome(options=options)
            logger.info("WebDriver initialized successfully")

    @lru_cache(maxsize=100)
    def get_location_coordinates(self, address: str) -> Tuple[Optional[float], Optional[float]]:
        """Get latitude and longitude for a given address with caching"""
        try:
            location = self.geolocator.geocode(address)
            if location:
                return location.latitude, location.longitude
            return None, None
        except Exception as e:
            logger.error(f"Error getting coordinates for {address}: {e}")
            return None, None

    def get_place_details(self, place_name: str, address: str) -> Optional[Dict]:
        """Fetch comprehensive place details from Google Maps"""
        if not self.driver:
            self.setup_driver()

        try:
            search_query = f"{place_name} {address}"
            search_query = search_query.replace(' ', '+')
            url = f"https://www.google.com/maps/search/?api=1&query={search_query}"
            
            self.driver.get(url)
            time.sleep(3)  # Increased wait time for better page load

            place_data = {
                'rating': None,
                'opening_hours': None,
                'reviews_count': None,
                'phone': None,
                'website': None,
                'price_level': None
            }

            # Extract rating and reviews count
            try:
                rating_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.gm2-display-2"))
                )
                place_data['rating'] = float(rating_element.text)

                reviews_element = self.driver.find_element(By.CSS_SELECTOR, "div.gm2-caption")
                place_data['reviews_count'] = reviews_element.text
            except Exception as e:
                logger.warning(f"Could not extract rating/reviews: {e}")

            # Extract opening hours
            try:
                hours_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='opening-hours']"))
                )
                place_data['opening_hours'] = hours_element.text
            except Exception as e:
                logger.warning(f"Could not extract opening hours: {e}")

            # Extract additional details
            try:
                # Click on the place to get more details
                place_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='place-card']"))
                )
                place_element.click()
                time.sleep(2)

                # Extract phone number
                try:
                    phone_element = self.driver.find_element(By.CSS_SELECTOR, "button[data-tooltip*='phone']")
                    place_data['phone'] = phone_element.get_attribute('aria-label')
                except:
                    pass

                # Extract website
                try:
                    website_element = self.driver.find_element(By.CSS_SELECTOR, "a[data-tooltip*='website']")
                    place_data['website'] = website_element.get_attribute('href')
                except:
                    pass

                # Extract price level
                try:
                    price_element = self.driver.find_element(By.CSS_SELECTOR, "span[class*='price-level']")
                    place_data['price_level'] = len(price_element.text)
                except:
                    pass

            except Exception as e:
                logger.warning(f"Could not extract additional details: {e}")

            return place_data

        except Exception as e:
            logger.error(f"Error scraping place details: {e}")
            return None

    def get_travel_time(self, origin_address: str, destination_address: str, transport_type: str = 'driving') -> Optional[Dict]:
        """Get detailed travel information between two locations"""
        if not self.driver:
            self.setup_driver()

        try:
            origin = origin_address.replace(' ', '+')
            destination = destination_address.replace(' ', '+')
            url = f"https://www.google.com/maps/dir/{origin}/{destination}/"
            
            self.driver.get(url)
            time.sleep(3)

            travel_data = {
                'estimated_travel_time': None,
                'distance': None,
                'route_summary': None
            }

            # Extract travel time
            try:
                time_element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='duration']"))
                )
                travel_data['estimated_travel_time'] = time_element.text
            except Exception as e:
                logger.warning(f"Could not extract travel time: {e}")

            # Extract distance
            try:
                distance_element = self.driver.find_element(By.CSS_SELECTOR, "div[class*='distance']")
                travel_data['distance'] = distance_element.text
            except Exception as e:
                logger.warning(f"Could not extract distance: {e}")

            # Extract route summary
            try:
                route_element = self.driver.find_element(By.CSS_SELECTOR, "div[class*='route-summary']")
                travel_data['route_summary'] = route_element.text
            except Exception as e:
                logger.warning(f"Could not extract route summary: {e}")

            return travel_data

        except Exception as e:
            logger.error(f"Error getting travel time: {e}")
            return None

    def close(self):
        """Close the WebDriver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info("WebDriver closed successfully") 