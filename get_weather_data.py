import sys
import datetime
import json
import urllib.request

apikey = "YOUR_APIKEY_HERE"
lat = 40.7648
long = -73.9808

data = []

if apikey == "YOUR_APIKEY_HERE":
    print("Make sure to update the script with your Darksky apikey - find it at https://darksky.net/dev/account.")
    print("More info in the Appendix")
    sys.exit()

if lat == 40.7648 and long == -73.9808:
    print("If you're not in NYC, make sure you update the latitude and longitude values to get your custom data!")
    print("Make sure to kill this script (ctrl+c) if not, to preserve your 1,000 daily api calls.")
    print("Here's a good website to get your coordinates: gps-coordinates.org")


api_url_base = "https://api.darksky.net/forecast/%s/" % apikey
max_days_back = 365
start_date = datetime.datetime.today() - datetime.timedelta(days=(max_days_back + 1))
for days_back in range(max_days_back):
    date = start_date + datetime.timedelta(days=days_back)
    date_string = date.strftime('%Y-%m-%d')
    url = api_url_base + "%s,%s,%sT12:00:00" % (lat, long, date_string)
    res = urllib.request.urlopen(url).read()
    try:
        print("Grabbing data for %s" % date_string)
        weather_data = json.loads(res)
        daily_weather_data = weather_data["daily"]["data"][0]
        daily_weather_data.update({ "date": date_string })
        data.append(daily_weather_data)
    except:
        print("Trouble loading data for %s" % date_string)

data_file = open('my_weather_data.json', 'w')
data_file.seek(0)
data_file.truncate()
data_file.write(json.dumps(data))