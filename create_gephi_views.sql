DROP VIEW IF EXISTS nodes;
DROP VIEW IF EXISTS edges;


CREATE VIEW nodes AS
SELECT DISTINCT i.key AS id ,
                x.title AS label ,
                x.abstract AS abstract ,
                x.url
FROM items i
JOIN
  (SELECT id.itemID ,
          MAX(CASE WHEN lower(f.fieldName) = 'url' THEN idv.value END) AS url ,
          MAX(CASE WHEN lower(f.fieldName) = 'abstractnote' THEN idv.value END) AS abstract ,
          MAX(CASE WHEN lower(f.fieldName) = 'title' THEN idv.value END) AS title
   FROM itemData id
   JOIN fields f ON id.fieldID = f.fieldID
   JOIN itemDataValues idv ON id.valueID = idv.valueID
   WHERE lower(f.fieldName) IN ('title',
                                'abstractnote',
                                'url')
   GROUP BY id.itemID) x ON i.itemID = x.itemID
JOIN collectionItems ci ON i.itemID = ci.itemID
JOIN itemTypes it ON i.itemTypeID = it.itemTypeID
JOIN itemTypeFields itf ON itf.itemTypeID = it.itemTypeID
WHERE ci.collectionID = 1
  AND lower(it.typeName) = 'computerprogram'
ORDER BY typeName;


CREATE VIEW edges AS
SELECT i.key AS SOURCE,
       li.key AS target,
       1 AS weight
FROM itemSeeAlso isa
JOIN items i ON i.itemID = isa.itemID
JOIN items li ON li.itemID = isa.linkedItemID
JOIN collectionItems ci ON i.itemID = ci.itemID
WHERE ci.collectionID = 1;