# bibliotecas
import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import locale
locale.setlocale(locale.LC_ALL, 'pt_BR.utf8')



today = datetime.now()
matches = []
seeds = []


def daysFromToday(date):
    return (date - today).days + 1


# Retorna os seeds para fazer o scrapping posteriormente.
def getSeeds():

    seed = "https://www.espn.com.br/futebol/times"

    # Coleta a página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')


    for link in soup.find_all('a', {"class" : "AnchorLink"}):
        href = link.get("href")
        if "time" in href.split('/') and "calendario" in href.split('/'): 
            new_seed = f"https://www.espn.com.br{href}"
            if(new_seed not in seeds):
                seeds.append(new_seed)

    return seeds


# Coleta os dados de onde assistir os jogos.
def scrappingTransmissions(date, team_home, team_away):

    transmissions = []
    formatted_date = date.strftime('%d-%m-%Y')
    seed = f"https://www.uol.com.br/esporte/futebol/central-de-jogos/#/{formatted_date}"
    page = requests.get(seed)
    soup = BeautifulSoup(page.text, 'html.parser')

    print(f"Searching for transmission info... \n Seed: " + seed)

    match_wraps = soup.find_all('div', {"class" : "match-full match-wrapper"})
    data = dict()
    for match in match_wraps:

        data_match = match.get('data-cfg')
        data = json.loads(data_match)
        date_match_string = data["data"].split(' ')[1]
        date_match = f"{date_match_string}/{today.year}"


        if(date_match != formatted_date.replace("-", "/")): continue


        current_team_home = data["time1"].upper()
        current_team_away = data["time2"].upper()

        current_teams = [current_team_home, current_team_away]

        if(team_home.upper() in current_teams or team_away.upper() in current_teams):
            transmissions_container = match.find('div', {"class" : "transmitions"})

            try:
                transmissions_links = transmissions_container.findAll('a')
                for link in transmissions_links:
                    transmissions.append(link.contents[0])
            except:
                return [""]
            print(transmissions)
            return transmissions





# Coleta os dados dos times.
def scrapping (seed) : 
    team = {}
    games_data = []

    # Coleta a primeira página.
    page = requests.get(seed)

    soup = BeautifulSoup(page.text, 'html.parser')



    ID = seed.split('/')[8]

    # Nome do time
    team_name = soup.find('span', {"class": "db fw-bold"}).text.strip()

    #Logo do time
    team_logo = f"https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/{ID}.png&h=200&w=200"


    print(f"Scrapping {team_name}...")

    

    # Pega todo texto da div que contém os jogos pelos meses.
    months = soup.find_all(class_='ResponsiveTable Table__fixtures')

    for month in months:
        # Mês e ano
        month_year = month.find(class_='Table__Title')
        month_year_string = month_year.contents[0]
        month_year_string_split = month_year_string.replace(" ", "").split(',')
        month_date = month_year_string_split[0].title()
        year_date = month_year_string_split[1]
        

        # Dados dos jogos
        body = month.find(class_='Table__TBODY')
        rows = body.find_all('tr')

        for row in rows:
            cells = row.find_all('td')
            if len(cells) == 0:
                continue
            date = cells[0].text.strip().split(' ')[1]
            team_home = cells[1].text.strip()
            team_away = cells[3].text.strip()
            time = cells[4].text.strip()
            championship = cells[5].text.strip()
            tv = ['']

            date_str = f"{date} {month_date} {year_date}"

            date_obj = datetime.strptime(date_str, '%d %B %Y')
            formatted_date = date_obj.strftime('%d-%m-%Y')

            # dias entre hoje e a data.
            days = daysFromToday(date_obj)
            
            if(days <= 2):
                tv = scrappingTransmissions(date_obj, team_home, team_away)

            games_data.append({"team_home":team_home, "team_away" :team_away, "date":formatted_date,"time":time, "championship": championship, "tv": tv})
            

    team["name"] = team_name
    team["logo"] = team_logo
    team["matches"] = games_data
    matches.append(team)


seeds = getSeeds()
for seed in seeds:
    scrapping(seed)

# scrappingTransmissions(today, 'Remo', 'Corinthians')

with open("./assets/json/matches.json", "w", encoding="utf-8") as outfile:
    json.dump(matches, outfile, ensure_ascii=False)


        

 