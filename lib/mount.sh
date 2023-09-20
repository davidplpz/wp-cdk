#! /bin/bash
sudo su

apt -y update

apt -y install nginx php php-mysql mysql-server

service nginx restart

service mysqld start

#Securizamos mysql
nano secure_db.sql

echo "
UPDATE mysql.user SET Password=PASSWORD('root') WHERE User='root';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS wp;
DELETE FROM mysql.db WHERE Db='wp' OR Db='wp\\_%';
FLUSH PRIVILEGES;" > secure_db.sql

mysql -sfu root < "secure_db.sql"

# Creamos una db por defecto llamada wp_db
mysqladmin -uroot create wp_db

cd /var/www/html

#Wordpresss
wget http://wordpress.org/latest.tar.gz

tar -xzvf latest.tar.gz

mv wordpress wp

chown -R www-data:www-data /var/www/wp

cd /var/www/html/wp/

mv wp-config-sample.php wp-config.php


sed -i "s/database_name_here/wp/g" /var/www/html/wp/wp-config.php
sed -i "s/username_here/root/g" /var/www/html/wp/wp-config.php
sed -i "s/password_here/my-secret-password/g" /var/www/html/wp/wp-config.php

mkdir wp-content/uploads
chmod 777 wp-content/uploads

# Borramos el zip de Wordpress
rm -rf /var/www/html/latest.tar.gz