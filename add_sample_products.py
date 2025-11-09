"""
Add Sample Products to Database
Persian products for testing the shop
"""

import sys
sys.path.insert(0, '/home/user/Elnaz')

from backend.models import Product

# Sample products in Persian
sample_products = [
    {
        'name_fa': 'تابلوی نقاشی رویاهای غروب',
        'name_en': 'Sunset Dreams Painting',
        'description_fa': 'نقاشی رنگ روغن اورجینال روی بوم، ۹۰×۱۲۰ سانتی‌متر. اثری انتزاعی با رنگ‌های گرم و الهام‌بخش',
        'description_en': 'Original oil painting on canvas, 90x120cm. Abstract artwork with warm and inspiring colors',
        'price': 45000000,
        'category': 'نقاشی',
        'stock_quantity': 1
    },
    {
        'name_fa': 'پرینت محدود سایه‌های شهری',
        'name_en': 'Urban Shadows Limited Print',
        'description_fa': 'چاپ محدود با کیفیت موزه‌ای (۲۵ از ۱۰۰). طراحی مدرن از مناظر شهری',
        'description_en': 'Museum quality limited edition print (25/100). Modern design of urban landscapes',
        'price': 8500000,
        'category': 'پرینت',
        'stock_quantity': 25
    },
    {
        'name_fa': 'تابلوی اکریلیک زمزمه‌های اقیانوس',
        'name_en': 'Ocean Whispers Acrylic',
        'description_fa': 'نقاشی اکریلیک روی بوم، ۱۰۰×۱۵۰ سانتی‌متر. الهام گرفته از امواج و آرامش دریا',
        'description_en': 'Acrylic painting on canvas, 100x150cm. Inspired by ocean waves and serenity',
        'price': 52000000,
        'category': 'نقاشی',
        'stock_quantity': 1
    },
    {
        'name_fa': 'مجموعه چاپ خاطرات انتزاعی',
        'name_en': 'Abstract Memories Print Set',
        'description_fa': 'مجموعه ۳ تایی پرینت‌های هنری با قاب چوبی. مناسب برای دکوراسیون مدرن',
        'description_en': 'Set of 3 art prints with wooden frames. Perfect for modern decoration',
        'price': 15000000,
        'category': 'مجموعه',
        'stock_quantity': 10
    },
    {
        'name_fa': 'نقاشی طیف رنگ',
        'name_en': 'Color Spectrum Painting',
        'description_fa': 'اکریلیک روی بوم، ۸۰×۱۰۰ سانتی‌متر. ترکیب رنگ‌های جسورانه و زنده',
        'description_en': 'Acrylic on canvas, 80x100cm. Bold and vibrant color combinations',
        'price': 38000000,
        'category': 'نقاشی',
        'stock_quantity': 1
    },
    {
        'name_fa': 'احساسات روان - مدیای ترکیبی',
        'name_en': 'Fluid Emotions Mixed Media',
        'description_fa': 'مدیای ترکیبی روی بوم، ۷۰×۹۰ سانتی‌متر. ترکیب تکنیک‌های مختلف هنری',
        'description_en': 'Mixed media on canvas, 70x90cm. Combination of various artistic techniques',
        'price': 42000000,
        'category': 'مدیای ترکیبی',
        'stock_quantity': 1
    },
    {
        'name_fa': 'کلاژ دیجیتال نور اثیری',
        'name_en': 'Ethereal Light Digital Collage',
        'description_fa': 'پرینت هنر دیجیتال با کیفیت بالا، ۶۰×۸۰ سانتی‌متر. طرح منحصر به فرد',
        'description_en': 'High quality digital art print, 60x80cm. Unique design',
        'price': 12000000,
        'category': 'هنر دیجیتال',
        'stock_quantity': 15
    },
    {
        'name_fa': 'سری طلایی - نقاشی کوچک',
        'name_en': 'Golden Series - Small Painting',
        'description_fa': 'نقاشی رنگ روغن روی بوم، ۴۰×۵۰ سانتی‌متر. مناسب برای فضاهای کوچک',
        'description_en': 'Oil painting on canvas, 40x50cm. Perfect for small spaces',
        'price': 18000000,
        'category': 'نقاشی',
        'stock_quantity': 3
    },
    {
        'name_fa': 'تابلوی سه‌تکه مینیمال',
        'name_en': 'Minimal Triptych',
        'description_fa': 'مجموعه سه تابلوی هماهنگ، هر کدام ۵۰×۷۰ سانتی‌متر. سبک مینیمالیستی',
        'description_en': 'Set of three coordinated paintings, each 50x70cm. Minimalist style',
        'price': 55000000,
        'category': 'مجموعه',
        'stock_quantity': 2
    },
    {
        'name_fa': 'پرینت الهام‌بخش روز جدید',
        'name_en': 'New Day Inspirational Print',
        'description_fa': 'چاپ باکیفیت موزه‌ای، ۵۰×۷۰ سانتی‌متر. پیام الهام‌بخش برای شروع روز',
        'description_en': 'Museum quality print, 50x70cm. Inspirational message for new beginnings',
        'price': 6500000,
        'category': 'پرینت',
        'stock_quantity': 30
    }
]

def add_products():
    """Add sample products to database"""
    print("Adding sample products to database...")
    print("=" * 60)

    for i, product in enumerate(sample_products, 1):
        try:
            product_id = Product.create(**product)
            print(f"✅ {i}. {product['name_fa']} - ID: {product_id}")
        except Exception as e:
            print(f"❌ {i}. Error: {product['name_fa']} - {str(e)}")

    print("=" * 60)
    print("✅ Sample products added successfully!")

if __name__ == '__main__':
    add_products()
