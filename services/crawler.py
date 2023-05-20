# bibliotecas
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import calendar




matches = []
teams = []
league_teams = []
all_matches_seeds = []
description = ''

league = ''
# first_accept_cookie = True


def getDatesSeeds():
    dates_seeds = ['https://onefootball.com/pt-br/jogos']
    today = datetime.now().strftime("%Y-%m-%d")
    
    date = datetime.strptime(today, "%Y-%m-%d")

    month_number = date.month
    new_month_number = (month_number + 1) % 12  # Somando 1 e obtendo o resto da divisão por 12

    year_number = date.year
    new_year_number = year_number + (month_number + 1) // 12  # Adicionando 1 ao ano se necessário
    # Obter o último dia válido do próximo mês
    last_day = calendar.monthrange(new_year_number, new_month_number)[1]
    new_date_string = f"{new_year_number}-{new_month_number:02d}-{last_day}"
    print(new_date_string)  


    end_date = datetime.strptime(new_date_string, "%Y-%m-%d")
    current_date = date

    while current_date <= end_date:
        curr = current_date.strftime("%Y-%m-%d")
        dates_seeds.append(f"https://onefootball.com/pt-br/jogos/?date={curr}")
        current_date += timedelta(days=1)
    return dates_seeds




def getMatchSeeds(seed):

    matches_seeds = []
    print(seed)

    # soup = BeautifulSoup(driver.page_source, 'html.parser')
    page = requests.get(seed)
    soup = BeautifulSoup(page.text, "html.parser")

    description = ''

    championship_matches = soup.find_all('div', {'class': 'XpaLayout_xpaLayoutContainerComponentResolver__32Dls xpaLayoutContainerComponentResolver--matchCardsList'})
    for championship in championship_matches:
        match_description_element = championship.find('div', {'class': 'SectionHeader_title__fVpdo'})
        if match_description_element:
            match_description_h3 = match_description_element.find('h3', {'class': 'title-7-medium SectionHeader_subtitle__vO7cC title-6-bold'})
            if match_description_h3:
                description = match_description_h3.contents[0]            
            matches_links = championship.find_all('a', {"class": "MatchCard_matchCard__JSuaw"})
            for link in matches_links:
                href = link.get("href")
                new_seed = f"https://onefootball.com{href}"
                if new_seed not in all_matches_seeds:
                    matches_seeds.append({"seed": new_seed, "description": description})
                    all_matches_seeds.append(new_seed)

   
    return matches_seeds

    
# Coleta os dados das partidas.
def scrapping (seed, description) : 
    match = {}

    # Coleta a página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')

    print(f"Scrapping {seed}...")

   
    
     
    teams = soup.find_all(class_="MatchScoreTeam_container__Wt_gJ")

    try:
        team_home_logo = teams[0].find('img', {"class": "EntityLogo_entityLogoImage___mo9D"}).attrs['src']
        team_home_name = teams[0].find('span', {"class": "MatchScoreTeam_name__KtOJo"}).contents[0]
        team_away_logo = teams[1].find('img', {"class": "EntityLogo_entityLogoImage___mo9D"}).attrs['src']
        team_away_name = teams[1].find('span', {"class": "MatchScoreTeam_name__KtOJo"}).contents[0]
        match_time = soup.find('span', {"class": "title-6-bold MatchScore_numeric__OJDQ3"}).contents[0]
        match_info = soup.find('ul', {"class": "MatchInfo_entries__lSpQD"}).find_all('li')

        championship_info = match_info[0].find_all('span')
        championship_logo = championship_info[0].find('img').attrs['src']
        championship_name = championship_info[2].contents[0]

        match_date = match_info[1].find_all('span')[2].contents[0]
        size = len(match_info)
        if(size >= 3):
            location = match_info[2].find_all('span')[2].contents[0]
        else:
            location = ''

        if(size > 3):
            tv = match_info[3].find_all('span')[2].contents[0]
        else:
            tv = ''
        
        is_onefootball = soup.find('p', {'class': 'text-5 FreeToAir_ftaVideo__partnerName__ey9Iz'})
        if is_onefootball:
            tv = is_onefootball.contents[0]
        match = {"team_home":team_home_name, "team_home_logo": team_home_logo, "team_away" :team_away_name, "team_away_logo": team_away_logo,"date":match_date,"time":match_time, "championship": championship_name, "championship_logo": championship_logo, "description" : description, "location": location, "tv": tv}

    except:
        print(f"Erro coleta da partida {seed}")
        return
    matches.append(match)



dates_seeds = getDatesSeeds()
for seed in dates_seeds:
    matches_seeds = getMatchSeeds(seed)
    count = len(matches_seeds)
    i = 0
    for match in matches_seeds:
        print(f"{i}/{count}")
        print(f"{round(i/count*100, 2):.2f}%")
        scrapping(match['seed'], match['description'])
        i+=1


with open("./assets/json/matches.json", "w", encoding="utf-8") as outfile:
    json.dump(matches, outfile, ensure_ascii=False)
