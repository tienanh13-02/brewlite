import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Cà phê sữa',
      price: 35000,
      imageUrl: '/images/cafe-sua.jpg',
      stock: 50,
    },
    {
      id: 2,
      name: 'Americano',
      price: 40000,
      imageUrl: '/images/americano.jpg',
      stock: 30,
    },
    {
      id: 3,
      name: 'Cappuccino',
      price: 45000,
      imageUrl: '/images/cappuccino.jpg',
      stock: 20,
    },
    {
      id: 4,
      name: 'Trà đào',
      price: 39000,
      imageUrl: '/images/tra-dao.jpg',
      stock: 25,
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}