import { Injectable } from '@nestjs/common';
const mysql = require("mysql2/promise"); // use the promise-based version of mysql2

@Injectable()
export class QueryService {

    async addingAdminGovernorateArea(){
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "clinicassistant",
          });
      
          // Check if admintables has zero records
          try {
            const [rows, fields] = await connection.execute(
              'SELECT adminId FROM admins LIMIT 1'
            );
            if (rows.length === 0) {
              await connection.execute(
                `INSERT INTO admins (isAdmin, email, password, createdAt) VALUES
                (TRUE, 'admin@gmail.com', '$2a$10$hHmY6rPXtzFRoBsWoseoae8XpcJF4rn/j.Sdw4P8/aJCKi./j2iGW', NOW())`
              );
            }
          } catch (err) {
            console.log('Error checking admintables:', err);
          }
      
          // Check if governorates table has zero records
          try {
            const [rows, fields] = await connection.execute(
              'SELECT governorateId FROM governorates LIMIT 1'
            );
            if (rows.length === 0) {
              await connection.execute(`
                INSERT INTO governorates (name) VALUES
                ('إدلب'),
                ('الحسكة'),
                ('حلب'),
                ('حماة'),
                ('حمص'),
                ('دير الزور'),
                ('دمشق'),
                ('درعا'),
                ('الرقة'),
                ('ريف دمشق'),
                ('السويداء'),
                ('طرطوس'),
                ('القنيطرة'),
                ('اللاذقية')
              `);
            }
          } catch (err) {
            console.log('Error checking governorates table:', err);
          }
      
          
          // Check if MonthlySubscriptions table has zero records
          try {
            const [rows, fields] = await connection.execute(
              'SELECT id FROM MonthlySubscriptions LIMIT 1'
            );
            if (rows.length === 0) {
              await connection.execute(`
              
                INSERT INTO monthlySubscriptions (id,amountOfMoney) VALUES
                (0,40000)
                `);
              }
            } catch (err) {
              console.log('Error checking areas table:', err);
            }








          // Check if areas table has zero records
          try {
            const [rows, fields] = await connection.execute(
              'SELECT areaId FROM areas LIMIT 1'
            );
            if (rows.length === 0) {
              await connection.execute(`
                INSERT INTO areas (name, governorateGovernorateId) VALUES
                  ('إدلب', 1),
                  ('معرة النعمان', 1),
                  ('أريحا', 1),
                  ('حارم', 1),
                  ('جسر الشغور', 1),
                  ('الحسكة', 2),
                  ('رأس العين', 2),
                  ('المالكية', 2),
                  ('القامشلي', 2),
                  ('جبل سمعان', 3),
                  ('أعزاز', 3),
                  ('الأتارب', 3),
                  ('الباب', 3),
                  ('جرابلس', 3),
                  ('دير حافر', 3),
                  ('السفيرة', 3),
                  ('عفرين', 3),
                  ('عين العرب', 3),
                  ('منبج', 3),
                  ('حماه', 4),
                  ('السقيلبية', 4),
                  ('السلمية', 4),
                  ('محردة', 4),
                  ('مصياف', 4),
                  ('حمص', 5),
                  ('الرستن', 5),
                  ('تدمر', 5),
                  ('المخرّم', 5),
                  ('القصير', 5),
                  ('تلكلخ', 5),
                  ('دير الزور', 6),
                  ('البوكمال', 6),
                  ('الميادين', 6),
                  ('دمشق القديمة', 7),
                  ('ساروجة', 7),
                  ('القنوات', 7),
                  ('جوبر', 7),
                  ('الميدان', 7),
                  ('الشاغور', 7),
                  ('القدم', 7),
                  ('كفر سوسة', 7),
                  ('المزة', 7),
                  ('دمر', 7),
                  ('برزة', 7),
                  ('القابون', 7),
                  ('ركن الدين', 7),
                  ('الصالحية', 7),
                  ('المهاجرين', 7),
                  ('اليرموك', 7),
                  ('مركز ريف دمشق', 8),
                  ('التل', 8),
                  ('داريا', 8),
                  ('دوما', 8),
                  ('الزبداني', 8),
                  ('قدسيا', 8),
                  ('قطنا', 8),
                  ('القطيفة', 8),
                  ('النبك', 8),
                  ('يبرود', 8),
                  ('الكسوة', 8),
                  ('السويداء', 9),
                  ('شهبا', 9),
                  ('صلخد', 9),
                  ('طرطوس', 10),
                  ('صافيتا', 10),
                  ('دريكيش', 10),
                  ('الشيخ بدر', 10),
                  ('بانياس', 10),
                  ('القنيطرة', 11),
                  ('فيق', 11),
                  ('اللاذقية', 12),
                  ('القرداحة', 12),
                  ('الحفّة', 12),
                  ('جبلة', 12)
              `);
            }
          } catch (err) {
            console.log('Error checking areas table:', err);
          }
    
    }
}
