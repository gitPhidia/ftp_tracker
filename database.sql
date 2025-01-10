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
((SELECT id FROM platforms WHERE name = 'site_web'), 'focicom_database'),
