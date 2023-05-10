# bibliotecas
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


options = webdriver.ChromeOptions()
options.add_argument('--headless') # Habilita o modo headless
driver = webdriver.Chrome()


today = datetime.now()
matches = []
matches_seeds = []
team_seeds = []
league_seeds = ['https://onefootball.com/pt-br/competicao/brasileirao-serie-a-16/tabela']
league = ''
first_accept_cookie = True



# Retorna os seeds para fazer o scrapping posteriormente.
def getTeamSeeds(seed):

    # Coleta a página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')

    league = soup.find('p', {"class": "title-2-bold"}).contents[0]
    for link in soup.find_all('a', {"class" : "standings__row-grid"}):
        href = link.get("href")
        new_seed = f"https://onefootball.com{href}/jogos"
        if(new_seed not in team_seeds):
            team_seeds.append(new_seed)

    return (sorted(team_seeds), league)



def getMatchSeeds(team_seed):

    driver.get(team_seed)

    print('Starting')

    # Espera até que o elemento de aceitação de cookies seja carregado na página
    global first_accept_cookie
    if(first_accept_cookie):
        wait = WebDriverWait(driver, 10)
        cookie_banner = wait.until(EC.presence_of_element_located((By.ID, "onetrust-group-container")))
        accept_button = cookie_banner.find_element(By.XPATH, "//button[@id='onetrust-reject-all-handler']")
        accept_button.click()
        load_matches_button = wait.until(EC.presence_of_element_located((By.XPATH, "//button[@class='of-button of-button--ghost']")))
        load_matches_button.click()
        first_accept_cookie = False

    else:
        # Espera até que o botão de carregamento de partidas seja carregado na página
        load_matches_button = driver.find_element(By.XPATH, "//button[@class='of-button of-button--ghost']")
        load_matches_button.click()

    driver.implicitly_wait(10)
    time.sleep(1.5)

    
    
    # except NoSuchElementException:
    #     print("Não foi possível encontrar o botão de carregamento de partidas.")
    # except ElementClickInterceptedException:
    #     print("Não foi possível clicar no botão de carregamento de partidas.")


    page = requests.get(team_seed)

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # soup = BeautifulSoup(team_seed, "html.parser")

    # team_name = soup.find('p', {"class": "title-2-bold"}).contents[0]
    # team_logo = soup.find('picture', {"class": "of-image__picture"}).find('source').attrs['srcset']

    for link in soup.find_all('a', {"class" : "match-card"}):
        href = link.get("href")
        new_seed = f"https://onefootball.com{href}"
        if(new_seed not in matches_seeds):
            matches_seeds.append(new_seed)
    return matches_seeds

    
# Coleta os dados das partidas.
def scrapping (seed) : 
    match = {}
    games_data = []

    # Coleta a página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')

    print(f"Scrapping {seed}...")


    teams = soup.find_all(class_="MatchScoreTeam_container__tRx4x")

    try:
        team_home_logo = teams[0].find('img', {"class": "EntityLogo_entityLogoImage___mo9D"}).attrs['src']
        team_home_name = teams[0].find('span', {"class": "MatchScoreTeam_name__3KTX8"}).contents[0]
        team_away_logo = teams[1].find('img', {"class": "EntityLogo_entityLogoImage___mo9D"}).attrs['src']
        team_away_name = teams[1].find('span', {"class": "MatchScoreTeam_name__3KTX8"}).contents[0]
        match_date = soup.find('time', {"class": "MatchScore_kickoffDate__39yHZ"}).find('span').contents[0]
        match_time = soup.find('time', {"class": "MatchScore_kickoffTime__6Zixj"}).find('span').contents[0]
        match_info = soup.find('ul', {"class": "MatchInfo_entries__lSpQD"}).find_all('li')

        championship_info = match_info[0].find_all('span')
        championship_logo = championship_info[0].find('img').attrs['src']
        championship_name = championship_info[2].contents[0]

        location = match_info[2].find_all('span')[2].contents[0]

        size = len(match_info)
        if(size == 4):
            tv = match_info[3].find_all('span')[2].contents[0]
        else:
            tv = ''
        match = {"team_home":team_home_name, "team_home_logo": team_home_logo, "team_away" :team_away_name, "team_away_logo": team_away_logo,"date":match_date,"time":match_time, "championship": championship_name, "championship_logo": championship_logo, "location": location, "tv": tv}

    except:
        print(f"Erro coleta da partida {seed}")
    matches.append(match)



for seed in league_seeds:
    team_seeds, league = getTeamSeeds(seed)


count = len(team_seeds)
i = 0
for team in team_seeds:
    print(f"{i}/{count}")
    matches_seeds = getMatchSeeds(team)
    i+=1

count = len(matches_seeds)
i = 0
for match in matches_seeds:
    print(f"{i}/{count}")
    scrapping(match)
    i+=1


print(matches)
with open("./assets/json/matches.json", "w", encoding="utf-8") as outfile:
    json.dump(matches, outfile, ensure_ascii=False)


        

 