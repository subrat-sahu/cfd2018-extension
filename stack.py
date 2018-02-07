from bs4 import BeautifulSoup
import requests, urllib

s = 'buffer overflow'
search = urllib.parse.quote_plus(s)
base = 'https://stackoverflow.com'
target = 'https://stackoverflow.com/search?q='

def hit(search) :
	r = requests.get(target+search)
	soup = BeautifulSoup(r.text, "lxml")
	result1 = soup.find_all("div", {'class':'search-results js-search-results'})
	result2 = result1[0].find_all("div", {'class':'question-summary search-result'})
	json = {}
	c = 0
	for x in result2 :
		try :
			j = {
				'votes':x.find_all("span", {'class':'vote-count-post'})[0].text, 
				'answers':x.find_all("div", {'class':'status answered-accepted'})[0].find_all("strong")[0].text,
				'question':x.find_all("a")[0].text.replace("\n",""), 
				'question_url':base+x.find_all("a")[0]['href'], 
				'description':x.find_all("div", {'class':'excerpt'})[0].text.replace("\n","")
			}
			json[c] = j
			c += 1
		except :
			pass
	
	return json

print(hit("buffer"))