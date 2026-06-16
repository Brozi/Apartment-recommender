from crawler import PingCrawler

if __name__ == '__main__':
    ping_crawler = PingCrawler(listings_col='properties_test')
    pages, total_listings = ping_crawler.count_pages()
    ping_crawler.start_(pages)