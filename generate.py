import sqlite3
from csvkit.utilities.csvjson import CSVJSON
from csvkit.unicsv import UnicodeCSVWriter


with sqlite3.connect('AnimaliaParadoxa.sqlite') as conn:
    c = conn.cursor()
    
    with open('create_gephi_views.sql', 'r') as f:
        sql = f.read()
        c.executescript(sql)

    with open('create_export_view.sql', 'r') as f:
        sql = f.read()
        c.executescript(sql)

    with open('AnimaliaParadoxa.csv', 'wb') as f:
        c.execute("SELECT * FROM animalia ORDER BY title;")
        csvwriter = UnicodeCSVWriter(f, encoding='utf-8')
        csvwriter.writerow([i[0] for i in c.description])
        csvwriter.writerows(c)

with open('AnimaliaParadoxa.json', 'w') as f:
    args = ["AnimaliaParadoxa.csv"]
    CSVJSON(args, f).main()