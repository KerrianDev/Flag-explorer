from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests
import os

URL = "https://commons.wikimedia.org/wiki/Flags_of_municipalities_of_Minas_Gerais"
OUTPUT_DIR = "flags_minas"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Lancer Chrome
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

driver.get(URL)

# attendre que la page charge
time.sleep(5)

# récupérer les blocs
items = driver.find_elements(By.CSS_SELECTOR, ".gallerybox")

print(f"{len(items)} flags trouvés")

for item in items:
    try:
        name = item.find_element(By.CSS_SELECTOR, ".gallerytext").text.strip()
        name = name.replace("\n", "").replace(" ", "_").replace("/", "_")

        link = item.find_element(By.TAG_NAME, "a").get_attribute("href")

        # ouvrir page du fichier
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        driver.get(link)

        time.sleep(2)

        # récupérer image HD
        img = driver.find_element(By.CSS_SELECTOR, ".fullImageLink a")
        img_url = img.get_attribute("href")

        img_data = requests.get(img_url).content

        with open(f"{OUTPUT_DIR}/{name}.png", "wb") as f:
            f.write(img_data)

        print(f"✔ {name}")

        # fermer onglet
        driver.close()
        driver.switch_to.window(driver.window_handles[0])

    except Exception as e:
        print(f"❌ erreur : {e}")

driver.quit()