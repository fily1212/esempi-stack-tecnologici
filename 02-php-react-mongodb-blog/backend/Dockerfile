# Usa l'immagine ufficiale PHP con Apache
FROM php:8.2-apache

# Installa dipendenze per MongoDB
RUN apt-get update && apt-get install -y \
    libssl-dev \
    libcurl4-openssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Installa l'estensione MongoDB per PHP
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Abilita mod_rewrite e headers per Apache
RUN a2enmod rewrite headers

# Configura Apache per permettere .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Installa Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Imposta la working directory
WORKDIR /var/www/html

# Copia composer.json e installa dipendenze
COPY composer.json composer.json
RUN composer install --no-dev --optimize-autoloader

# Espone la porta 80
EXPOSE 80

# Avvia Apache
CMD ["apache2-foreground"]
