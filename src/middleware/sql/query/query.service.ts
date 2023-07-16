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
                `INSERT INTO admins (type, email, password,active, createdAt) VALUES
                (0, 'admin@gmail.com', '$2a$10$hHmY6rPXtzFRoBsWoseoae8XpcJF4rn/j.Sdw4P8/aJCKi./j2iGW',true,NOW())`
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
                ('دمشق'),
                ('ريف دمشق'),
                ('حلب'),
                ('حماة'),
                ('حمص'),
                ('دير الزور'),
                ('إدلب'),
                ('درعا'),
                ('الرقة'),
                ('الحسكة'),
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
                INSERT INTO areas (areaId,name, governorateGovernorateId) VALUES
                (1, 'دمشق القديمة', 1),
                (2, 'ساروجة', 1),
                (3, 'القنوات', 1),
                (4, 'جوبر', 1),
                (5, 'الميدان', 1),
                (6, 'الشاغور', 1),
                (7, 'القدم', 1),
                (8, 'كفر سوسة', 1),
                (9, 'المزة', 1),
                (10, 'دمر', 1),
                (11, 'برزة', 1),
                (12, 'القابون', 1),
                (13, 'ركن الدين', 1),
                (14, 'الصالحية', 1),
                (15, 'المهاجرين', 1),
                (16, 'اليرموك', 1),
                (17, 'مركز ريف دمشق', 2),
                (18, 'التل', 2),
                (19, 'داريا', 2),
                (20, 'دوما', 2),
                (21, 'الزبداني', 2),
                (22, 'قدسيا', 2),
                (23, 'قطنا', 2),
                (24, 'القطيفة', 2),
                (25, 'النبك', 2),
                (26, 'يبرود', 2),
                (27, 'الكسوة', 2),
                (28, 'جبل سمعان', 3),
                (29, 'أعزاز', 3),
                (30, 'الأتارب', 3),
                (31, 'الباب', 3),
                (32, 'جرابلس', 3),
                (33, 'دير حافر', 3),
                (34, 'السفيرة', 3),
                (35, 'عفرين', 3),
                (36, 'عين العرب', 3),
                (37, 'منبج', 3),
                (38, 'السقيلبية', 4),
                (39, 'السلمية', 4),
                (40, 'محردة', 4),
                (41, 'مصياف', 4),
                (42, 'الرستن', 5),
                (43, 'تدمر', 5),
                (44, 'المخرم', 5),
                (45, 'القصير', 5),
                (46, 'تلكخ', 5),
                (47, 'البوكمال', 6),
                (48, 'الميادين', 6),
                (49, 'معرة النعمان', 7),
                (50, 'أريحا', 7),
                (51, 'حارم', 7),
                (52, 'جسر الشاغور', 7),
                (53, 'ازرع', 8),
                (54, 'الصنمين', 8),
                (55, 'الثورة', 9),
                (56, 'تل أبيض', 9),
                (57, 'رأس العين', 10),
                (58, 'المالكية', 10),
                (59, 'القامشلي', 10),
                (60, 'شهبا', 11),
                (61, 'صلخد', 11),
                (62, 'صافيتا', 12),
                (63, 'دريكيش', 12),
                (64, 'الشيخ بدر', 12),
                (65, 'بانياس', 12),
                (66, 'فيق', 13),
                (67, 'القرداحة', 14),
                (68, 'جبلة', 14),
                (69, 'الحفة', 14);
              `);
            }
          } catch (err) {
            console.log('Error checking areas table:', err);
          }
    
    }
}
