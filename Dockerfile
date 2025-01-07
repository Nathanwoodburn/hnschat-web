# Start with the official Apache2 image
FROM php:8.1-apache

# Install additional PHP extensions if needed
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable mod_rewrite (commonly required for Apache)
RUN a2enmod rewrite
RUN a2enmod proxy
RUN a2enmod proxy_http
RUN a2enmod proxy_wstunnel
RUN a2enmod headers

# Copy your PHP application to the web server's document root
COPY ./ /var/www/html/

# Set proper permissions for Apache to access the files
RUN chown -R www-data:www-data /var/www/html/

# Copy config
COPY ./000-default.conf /etc/apache2/sites-available/000-default.conf
COPY ./apache2.conf /etc/apache2/apache2.conf

# Expose port 80
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]
