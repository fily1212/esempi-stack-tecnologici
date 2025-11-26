# Usa l'immagine ufficiale PHP con Apache
FROM php:8.2-apache

# Installa estensioni PHP necessarie
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Abilita mod_rewrite per Apache
RUN a2enmod rewrite

# Abilita CORS headers
RUN a2enmod headers

# Configura Apache per permettere .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Imposta la working directory
WORKDIR /var/www/html

# Espone la porta 80
EXPOSE 80

# Avvia Apache
CMD ["apache2-foreground"]
