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
driver = webdriver.Chrome(options=options)


today = datetime.now()
matches = []
teams = []
league_teams = []
league_seeds = ['https://onefootball.com/pt-br/competicao/brasileirao-serie-a-16/tabela', 'https://onefootball.com/pt-br/competicao/brasileirao-serie-b-119/tabela', 'https://onefootball.com/pt-br/competicao/premier-league-9/tabela']
league = ''
first_accept_cookie = True



# Retorna os seeds para fazer o scrapping posteriormente.
def getTeamSeeds(seed, all_team_seeds):
    team_seeds = []
    # Coleta a página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')

    league = soup.find('p', {"class": "title-2-bold"}).contents[0]
    for link in soup.find_all('a', {"class" : "standings__row-grid"}):
        href = link.get("href")
        new_seed = f"https://onefootball.com{href}/jogos"
        if(new_seed not in all_team_seeds):
            all_team_seeds.append(new_seed)
            team_seeds.append(new_seed)
    return (team_seeds, league)



def getMatchSeeds(team_seed, all_matches_seeds, all_teams):

    matches_seeds = []
    driver.get(team_seed)

    # Espera até que o elemento de aceitação de cookies seja carregado na página

    try:
        global first_accept_cookie
        if(first_accept_cookie):
            wait = WebDriverWait(driver, 10)
            cookie_banner = wait.until(EC.presence_of_element_located((By.ID, "onetrust-group-container")))
            accept_button = cookie_banner.find_element(By.XPATH, "//button[@id='onetrust-reject-all-handler']")
            accept_button.click()
            load_matches_button = driver.find_element(By.XPATH, "//button[@class='of-button of-button--ghost']")
            load_matches_button.click()
            first_accept_cookie = False

        else:
            # Espera até que o botão de carregamento de partidas seja carregado na página
            load_matches_button = driver.find_element(By.XPATH, "//button[@class='of-button of-button--ghost']")
            load_matches_button.click()

        driver.implicitly_wait(10)
        time.sleep(1.5)
    except NoSuchElementException:
        print("Não foi possível encontrar o botão de carregamento de partidas.")
    except ElementClickInterceptedException:
        print("Não foi possível clicar no botão de carregamento de partidas.")
    except:
        print("Error on load full matches")

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # soup = BeautifulSoup(team_seed, "html.parser")

    matches_links = soup.find_all('a', {"class" : "match-card"})
    for link in matches_links:
        href = link.get("href")
        new_seed = f"https://onefootball.com{href}"
        if(new_seed not in all_matches_seeds):
            matches_seeds.append(new_seed)
            all_matches_seeds.append(new_seed)

    print(f"Partidas: {len(matches_links)}")
    for team_info in soup.find_all('div', {"class" : "entity-page-title"}):
        team_logo = team_info.find('source').attrs['srcset']
        team_name = team_info.find('p', {'class': 'title-2-bold'}).contents[0]
        team = {"name":team_name.strip(), "logo":team_logo}
        print(team)
        if team_name not in all_teams:
            all_teams.append(team)
    
    return sorted(matches_seeds)

    
# Coleta os dados das partidas.
def scrapping (seed) : 
    match = {}

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
        match_time = soup.find('time', {"class": "MatchScore_kickoffTime__6Zixj"}).find('span').contents[0]
        match_info = soup.find('ul', {"class": "MatchInfo_entries__lSpQD"}).find_all('li')

        championship_info = match_info[0].find_all('span')
        championship_logo = championship_info[0].find('img').attrs['src']
        championship_name = championship_info[2].contents[0]

        match_date = match_info[1].find_all('span')[2].contents[0]

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


all_team_seeds = []
all_matches_seeds = []
for seed in league_seeds:
    team_seeds, league = getTeamSeeds(seed, all_team_seeds)
    all_teams = []
    for team in sorted(team_seeds):
        print(f"Team {team}")
        matches_seeds = getMatchSeeds(team, all_matches_seeds, all_teams)
        count = len(matches_seeds)
        i = 0
        for match in matches_seeds:
            print(f"{i}/{count}")
            print(f"{round(i/count*100, 2):.2f}%")
            scrapping(match)
            i+=1
    team = {"league": league, "teams": all_teams}
    league_teams.append(team)


with open("./assets/json/matches.json", "w", encoding="utf-8") as outfile:
    json.dump(matches, outfile, ensure_ascii=False)

with open("./assets/json/teams.json", "w", encoding="utf-8") as outfile:
    json.dump(league_teams, outfile, ensure_ascii=False)

        

 