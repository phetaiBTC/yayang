import { Module } from '@nestjs/common';
import { AuthModule } from '../auth';
import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { BookTypesController } from './book-types/book-types.controller';
import { BookTypesService } from './book-types/book-types.service';
import { BooksController } from './books/books.controller';
import { BooksService } from './books/books.service';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { SuppliersController } from './suppliers/suppliers.controller';
import { SuppliersService } from './suppliers/suppliers.service';

@Module({
  imports: [AuthModule],
  controllers: [
    EmployeesController,
    CategoriesController,
    BookTypesController,
    BooksController,
    CustomersController,
    SuppliersController,
  ],
  providers: [
    EmployeesService,
    CategoriesService,
    BookTypesService,
    BooksService,
    CustomersService,
    SuppliersService,
  ],
})
export class MasterDataModule {}
