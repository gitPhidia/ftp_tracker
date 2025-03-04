CREATE TABLE platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    platform_regex TEXT NOT NULL
);

CREATE TABLE expected_basenames (
    id SERIAL PRIMARY KEY,
    platform_id INT NOT NULL,
    basename VARCHAR(255) NOT NULL,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);



CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    size NUMERIC DEFAULT 0.0,
    modified_at TIMESTAMP NOT NULL,
    extension TEXT NOT NULL,
    base_name TEXT,
    platform_id INT,
    platform_name TEXT,
    match_any_regex BOOLEAN NOT NULL,
    inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    deleted_at TIMESTAMP DEFAULT NULL 
);



CREATE OR REPLACE VIEW v_active_files  AS (
    SELECT * FROM files where deleted_at is  null
);

CREATE OR REPLACE VIEW v_file_with_basename AS (
    SELECT * FROM files WHERE base_name is not null and match_any_regex = true
);

CREATE OR REPLACE VIEW v_active_file_with_basename AS (
    SELECT * FROM v_file_with_basename where deleted_at is null
);







INSERT INTO platforms (name, platform_regex)
VALUES
('ebp', '^(?<baseName>.+)_backup_(?<date>\\d{4}_\\d{2}_\\d{2})_(?<time>\\d{6})_\\d+\\.(bak)$'),
('odoo', '^(?<baseName>.+)_(?<date>\\d{4}_\\d{2}_\\d{2})\\.(zip)$'),
('site_web', '^(?<baseName>.+)_(?<date>\\d{4}_\\d{2}_\\d{2})_(?<time>\\d{2}_\\d{2}_\\d{2})\\.(sql)$');

-- Pour la plateforme `ebp`
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'ebp'), 'CDC_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MADAPLAST_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4');

--data test 02 janv 2025

INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'ebp'), 'SOCIETE MADAPLAST EBP V11_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MADAPLAST_PAIE_HC_f9e92713-702a-4762-ba2d-83ad4b7f2769'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MADAPLAST_f9e92713-702a-4762-ba2d-83ad4b7f2769'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MADAPLAST_EBP_IMMO_V11_6966ac2d-e1b2-4944-a92f-1d1a8399c23f'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'LAP_MADAPLAST_ANALDEC2019_ad0c5b20-ed4a-4364-8256-25dbf849d6c7'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'FOCICOM REUNION_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'PLS_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'PRESTIGE LABO PHOTO_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MILLOT SA_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7'),
((SELECT id FROM platforms WHERE name = 'odoo'), 'issoufali_database'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'BB_MAY_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4')

;

-- Pour la plateforme `odoo`
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'odoo'), 'qlm_database');




----new data 06/01
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'ebp'), 'MILLOT_BIS_f9e92713-702a-4762-ba2d-83ad4b7f2769'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MILLOT_SA_IMMO_6966ac2d-e1b2-4944-a92f-1d1a8399c23f'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MILLOT_SA_Juin2020_f9e92713-702a-4762-ba2d-83ad4b7f2769'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MADAPLAST IMMO 2019_6966ac2d-e1b2-4944-a92f-1d1a8399c23f'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'SOCIETE MADAPLAST COMPTA EBP V11_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7');


--data 07/01
-- Pour la plateforme `site_web`
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'site_web'), 'monitoring_database'),
((SELECT id FROM platforms WHERE name = 'site_web'), 'gpnr_database');



--data 09

----new data 06/01
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'ebp'), 'PHIDIA2019_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'PHIDIA_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'PHIDIA_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MGBI_PAYE_3_f9e92713-702a-4762-ba2d-83ad4b7f2769'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'MGBI_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'EBP_MGBI_2020_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7');



WITH daily_files AS (
    SELECT DISTINCT base_name
    FROM files
    WHERE DATE(inserted_at) = '2025-01-06' -- Remplacez $1 par la date cible
      AND deleted_at IS NULL
)
SELECT eb.basename AS missing_base_name
FROM expected_basenames eb
LEFT JOIN daily_files df ON eb.basename = df.base_name
WHERE df.base_name IS NULL;


INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'site_web'), 'focicom_database')








-- enabled 
--MADAPLAST_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4
--LAP_MADAPLAST_ANALDEC2019_ad0c5b20-ed4a-4364-8256-25dbf849d6c7
--




ALTER TABLE expected_basenames ADD COLUMN "enabled" BOOLEAN DEFAULT true;

UPDATE expected_basenames SET enabled = false where id=2 or id=7;



----new data 26/02/2025
INSERT INTO expected_basenames (platform_id, basename)
VALUES
((SELECT id FROM platforms WHERE name = 'ebp'), 'NAJMI Pharma_0895452f-b7c1-4c00-a316-c6a6d0ea4bf4'),
((SELECT id FROM platforms WHERE name = 'ebp'), 'NAJMI_9c9c51d5-d6fd-44fc-9724-a63a935a6fc7');



--customer maj
CREATE TABLE customers (
    ID SERIAL PRIMARY KEY ,
    customer_name VARCHAR(50) NOT NULL,
    inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE customer_contacts(
    ID serial PRIMARY KEY ,
    mail VARCHAR(50) NOT NULL ,
    customer_id INT NOT NULL ,
    FOREIGN KEY (customer_id) REFERENCES customers(id) 
);



CREATE  TABLE "public".company ( 
	id                   serial  NOT NULL  ,
	name                 varchar(100)  NOT NULL  ,
	CONSTRAINT pk_company PRIMARY KEY ( id )
 );


CREATE  TABLE "public".company_contacts ( 
	id                   integer DEFAULT nextval('copmany_contacts_id_seq'::regclass) NOT NULL  ,
	mail                 varchar(50)  NOT NULL  ,
	company_id           integer  NOT NULL  ,
	CONSTRAINT pk_copmany_contacts PRIMARY KEY ( id )
 );


ALTER TABLE expected_basenames ADD COLUMN "customer_id" INTEGER;


ALTER TABLE "public".company_contacts ADD CONSTRAINT fk_copmany_contacts_company FOREIGN KEY ( company_id ) REFERENCES "public".company( id );


ALTER TABLE "public".expected_basenames ADD CONSTRAINT fk_expected_basenames FOREIGN KEY ( customer_id ) REFERENCES "public".customers( id );

ALTER TABLE "public".files ADD CONSTRAINT fk_files_platforms FOREIGN KEY ( platform_id ) REFERENCES "public".platforms( id );


CREATE OR REPLACE VIEW v_active_file_with_basename AS SELECT v_active_file_with_basename,
    v_file_with_basename.name,
    v_file_with_basename.size,
    v_file_with_basename.modified_at,
    v_file_with_basename.extension,
    v_file_with_basename.base_name,
    v_file_with_basename.platform_id,
    v_file_with_basename.platform_name,
    v_file_with_basename.match_any_regex,
    v_file_with_basename.inserted_at,
    v_file_with_basename.updated_at,
    v_file_with_basename.deleted_at
   FROM v_file_with_basename
  WHERE (v_file_with_basename.deleted_at IS NULL)


--customer 
INSERT INTO customers (customer_name) VALUES ('MGBI'),('MILLOT'),('NAJMI') ,('MADAPLAST') ,('QLM') , ('ISSOUFALI') , ('PLS');

--customer contacts
INSERT INTO customer_contacts(mail , customer_id )
VALUES 
('loic05@gmail.com' , 1 )




INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 2, 'MILLOT', '2025-02-26 09:36:52 AM', 1, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 3, 'NAJMI', '2025-02-26 09:36:52 AM', 1, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 5, 'QLM', '2025-02-26 09:36:52 AM', 1, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 6, 'ISSOUFALI', '2025-02-26 09:36:52 AM', 1, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 7, 'PLS', '2025-02-26 09:36:52 AM', 2, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 8, 'CDC', '2025-02-27 12:40:58 PM', 2, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 9, 'FOCICOM', '2025-02-27 12:41:14 PM', 2, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 10, 'FRACOMEX', '2025-02-27 02:06:42 PM', 2, false);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 1, 'MGBI', '2025-02-26 09:36:52 AM', 1, true);
INSERT INTO "public".customers( id, customer_name, inserted_at, company_id, "notify" ) VALUES ( 4, 'MADAPLAST', '2025-02-26 09:36:52 AM', 1, true);


INSERT INTO "public".company( id, name ) VALUES ( 1, 'MGBI');
INSERT INTO "public".company( id, name ) VALUES ( 2, 'ALITA');
INSERT INTO "public".company_contacts( id, mail, company_id ) VALUES ( 1, 'loic@mgbi.mg', 1);
INSERT INTO "public".company_contacts( id, mail, company_id ) VALUES ( 2, 'tahina@mgbi.mg', 1);
INSERT INTO "public".company_contacts( id, mail, company_id ) VALUES ( 3, 'loic@alita.re', 2);
INSERT INTO "public".company_contacts( id, mail, company_id ) VALUES ( 4, 'tahina@alita.re', 2);
INSERT INTO "public".customer_contacts( id, mail, customer_id ) VALUES ( 1, 'loicRavelo05@gmail.com', 1);
INSERT INTO "public".customer_contacts( id, mail, customer_id ) VALUES ( 2, 'fanamby@mgbi.mg', 1);

