import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { PurchaseOrder } from './purchase-order.entity';
import { Employee } from './employee.entity';
import { ImportDetail } from './import-detail.entity';

@Entity({ tableName: 'imports' })
export class Import {
  @PrimaryKey({ fieldName: 'import_id' }) importId!: number;
  @ManyToOne(() => PurchaseOrder, { fieldName: 'po_id' }) order!: PurchaseOrder;
  @ManyToOne(() => Employee, { fieldName: 'emp_id' }) employee!: Employee;
  @Property({ fieldName: 'import_date', onCreate: () => new Date() })
  importDate = new Date();

  @OneToMany(() => ImportDetail, (d) => d.import)
  details = new Collection<ImportDetail>(this);
}
