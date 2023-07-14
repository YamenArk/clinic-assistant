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




            //check specialties
            try {
              const [rows, fields] = await connection.execute(
                'SELECT specialtyId FROM specialties LIMIT 1'
              );
              if (rows.length === 0) {
                await connection.execute(`
                INSERT INTO specialties (specialtyId, specialtyName) VALUES
                (28, 'أمراض الكلية'),
                (5, 'أمرض الجهاز الهضمي'),
                (10, 'الأذن والأنف والحنجرة وجراحة الرأس والعنق'),
                (19, 'الأشعة والتصوير الطبي'),
                (2, 'الأطفال'),
                (12, 'الأمراض الجلدية'),
                (15, 'الأمراض الخمجية'),
                (16, 'الأمراض الدموية'),
                (30, 'الأمراض الرثوية'),
                (13, 'الأمراض النفسية'),
                (21, 'الأمراض الوراثية'),
                (14, 'الأورام'),
                (20, 'التشريح المرضي'),
                (25, 'الجراحة التجميلية'),
                (24, 'الجراحة الصدرية'),
                (4, 'الجراحة العامة'),
                (26, 'الجراحة القلبية'),
                (29, 'الداخلية العامة'),
                (17, 'الصحة العامة'),
                (18, 'العلاج الفيزيائي'),
                (9, 'العينية'),
                (22, 'المخبري'),
                (3, 'النسائية والتوليد'),
                (6, 'امراض الجهاز التنفسي'),
                (8, 'امراض الجهاز العصبي'),
                (7, 'امراض القلب والأوعية الدموية'),
                (23, 'جراحة الأوعية'),
                (11, 'جراحة العظام'),
                (27, 'جراحة المسالك البولية'),
                (1, 'طب الأسنان');
                `);
              }
            } catch (err) {
              console.log('Error checking areas table:', err);
            }
           


            
            //check subSpecialties
            try {
              const [rows, fields] = await connection.execute(
                'SELECT subSpecialtyId FROM subspecialties LIMIT 1'
              );
              if (rows.length === 0) {
                await connection.execute(`
              
                  INSERT INTO subspecialties (subSpecialtyId, subSpecialtyName, specialtySpecialtyId) VALUES
                  (1, 'عام', 1),
                  (2, 'عام', 2),
                  (3, 'عام', 3),
                  (4, 'عام', 4),
                  (5, 'عام', 5),
                  (6, 'عام', 6),
                  (7, 'عام', 7),
                  (8, 'عام', 8),
                  (9, 'عام', 9),
                  (10, 'عام', 10),
                  (11, 'عام', 11),
                  (12, 'عام', 12),
                  (13, 'عام', 13),
                  (14, 'عام', 14),
                  (15, 'عام', 15),
                  (16, 'عام', 16),
                  (17, 'عام', 17),
                  (18, 'عام', 18),
                  (19, 'عام', 19),
                  (20, 'عام', 20),
                  (21, 'عام', 21),
                  (22, 'عام', 22),
                  (23, 'عام', 23),
                  (24, 'عام', 24),
                  (25, 'عام', 25),
                  (26, 'عام', 26),
                  (27, 'عام', 27),
                  (28, 'عام', 28),
                  (29, 'عام', 29),
                  (30, 'عام', 30),
                  (31, 'تقويم الأسنان والفكين', 1),
                  (32, 'التعويضات الثابتة', 1),
                  (33, 'التعويضات المتحركة', 1),
                  (34, 'علم النسج حول السنية', 1),
                  (35, 'المداورة اللبية والترميمية', 1),
                  (36, 'طب الفم', 1),
                  (37, 'التشريح المرضى', 1),
                  (38, 'طب أسنان الأطفال', 1),
                  (39, 'طب الأسنان التجميلي', 1),
                  (40, 'جراحة الوجه والفم والفكين', 1);

                `);
              }
            } catch (err) {
              console.log('Error checking areas table:', err);
            }
           



                //check insurances
                try {
                  const [rows, fields] = await connection.execute(
                    'SELECT insuranceId FROM insurances LIMIT 1'
                  );
                  if (rows.length === 0) {
                    await connection.execute(`
                    INSERT INTO insurances (insuranceId, companyName) VALUES
                    (1, 'الشركة الإسلامية السورية  للتأمين'),
                    (8, 'الشركة السورية الدولية للتأمين'),
                    (10, 'الشركة السورية العربية للتأمين'),
                    (13, 'الشركة السورية الكويتية للتأمين'),
                    (9, 'الشركة السورية الوطنية للتأمين'),
                    (11, 'الشركة المتحدة للتأمين'),
                    (12, 'المؤسسة العامة السورية للتأمين'),
                    (2, 'شركة أدونيس للتأمين'),
                    (3, 'شركة الإتحاد التعاوني للتأمين'),
                    (7, 'شركة التأمين العربية سورية'),
                    (5, 'شركة الثقة السورية للتأمين'),
                    (4, 'شركة العقلية للتأمين التكافلي'),
                    (6, 'شركة المشرق العربي للتأمين');
                    
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
