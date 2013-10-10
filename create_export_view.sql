DROP VIEW IF EXISTS animalia;


CREATE VIEW animalia AS
SELECT DISTINCT i.key AS id,
                x.title AS title ,
                CASE
                    WHEN lower(it.typeName) = 'blogpost' THEN 'Blog Post'
                    WHEN lower(it.typeName) = 'book' THEN 'Book'
                    WHEN lower(it.typeName) = 'computerprogram' THEN 'Software'
                    WHEN lower(it.typeName) = 'conferencepaper' THEN 'Conference Paper'
                    WHEN lower(it.typeName) = 'email' THEN 'Email'
                    WHEN lower(it.typeName) = 'journalarticle' THEN 'Journal Article'
                    WHEN lower(it.typeName) = 'magazinearticle' THEN 'Magazine Article'
                    WHEN lower(it.typeName) = 'manuscript' THEN 'Manuscript'
                    WHEN lower(it.typeName) = 'newspaperarticle' THEN 'Newspaper Article'
                    WHEN lower(it.typeName) = 'presentation' THEN 'Presentation'
                    WHEN lower(it.typeName) = 'report' THEN 'Report'
                    WHEN lower(it.typeName) = 'videorecording' THEN 'Video'
                    WHEN lower(it.typeName) = 'webpage' THEN 'Web Page'
                    ELSE it.typeName
                END AS type ,
                CASE
                    WHEN lower(it.typeName) = 'book' THEN 'http://www.worldcat.org/search?q=isbn%3A' || substr(x.isbn, 0, instr(trim(x.isbn), ' '))
                    ELSE x.url
                END AS url
FROM items i
JOIN
  (SELECT id.itemID ,
          MAX(CASE WHEN lower(f.fieldName) = 'isbn' THEN idv.value END) AS isbn ,
          MAX(CASE WHEN lower(f.fieldName) = 'url' THEN idv.value END) AS url ,
          MAX(CASE WHEN lower(f.fieldName) = 'abstractnote' THEN idv.value END) AS abstract ,
          MAX(CASE WHEN lower(f.fieldName) = 'title' THEN idv.value WHEN lower(f.fieldName) = 'subject' THEN idv.value END) AS title
   FROM itemData id
   JOIN fields f ON id.fieldID = f.fieldID
   JOIN itemDataValues idv ON id.valueID = idv.valueID
   WHERE lower(f.fieldName) IN ('title',
                                'subject',
                                'abstractnote',
                                'url' ,
                                'isbn')
   GROUP BY id.itemID) x ON i.itemID = x.itemID
JOIN collectionItems ci ON i.itemID = ci.itemID
JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
JOIN itemTypeFields itf ON itf.itemTypeID = it.itemTypeID
WHERE ci.collectionID = 1;
