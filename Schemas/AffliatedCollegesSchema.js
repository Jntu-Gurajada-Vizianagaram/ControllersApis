const con = require('../apis/config');

const affiliatedCollegeSeed = [
  ['B6', '', 'Satya Institute of Technology and Management Vizianagaram', 'Vizianagaram', 'Permanent', 'https://www.sitam.co.in/', 'Engineering', 'Affiliated'],
  ['HQ', '', 'Avanthi Research and Technological Academy Basavapalem Bhogapuram', 'Vizianagaram', 'Temporary', 'https://arta.ac.in/', 'Engineering', 'Affiliated'],
  ['99', '', 'Avanthi St.Theressa Institute of Engineering and Tech Garividi', 'Vizianagaram', 'Temporary', 'https://www.sttheressaengg.ac.in/', 'Engineering', 'Affiliated'],
  ['8K', '', 'Gokul Group of Institutions Piridi Bobbili, Vizianagaram', 'Vizianagaram', 'Temporary', 'http://www.gokulcollege.com/', 'Engineering', 'Affiliated'],
  ['L6', '', 'Chaitanya Engineering College Kommadi Madhurawada Visakhapatnam', 'Visakhapatnam', 'Temporary', 'http://cec.ac.in/', 'Engineering', 'Affiliated'],
  ['6E', '', 'Gonna Institute of Information Technology and Sciences Aganampudi', 'Anakapalli', 'Temporary', 'http://www.giits.in/', 'Engineering', 'Affiliated'],
  ['6F', '', 'Sai Ganapathi Engineering College Gidijala Anandapuram, Visakhapatnam', 'Visakhapatnam', 'Temporary', 'https://www.sgec.edu.in/', 'Engineering', 'Affiliated'],
  ['6J', '', 'Simhadri Educational Society Group of Institutions Engineering College', 'Anakapalli', 'Temporary', 'https://simhadhriedu.com/', 'Engineering', 'Affiliated'],
  ['MT', '', 'Sri Venkateswara College of Engineering and Technology, Etcherla, Srikakulam', 'Srikakulam', 'Temporary', 'https://svcet.net/new/', 'Engineering', 'Affiliated'],
  ['PC', '', 'N S Raju Institute of Engineering & Technology Dakamarri Bheemunipatnam', 'Visakhapatnam', 'Temporary', 'https://www.nsriet.edu.in/', 'Engineering', 'Affiliated'],
  ['V1', '', 'Behara College of Engineering and Technology', 'Visakhapatnam', 'Temporary', 'https://beharaengg.edu.in/', 'Engineering', 'Affiliated'],
  ['HH', '', 'Gokul College of Pharmacy, Piridi, Bobbili, Vizianagaram', 'Vizianagaram', 'Temporary', 'https://www.gokulcollege.com/sites/Pharmacy/home.html', 'Pharmacy', 'Affiliated'],
  ['B7', '', 'Emmanuel College of Pharmacy Singannanbanda, Bheemunipatnam, Visakhapatnam', 'Visakhapatnam', 'Temporary', 'https://emmanuelcollegeofpharmacy.com/', 'Pharmacy', 'Affiliated'],
  ['PK', '', 'Viswanadha Institute of Pharmaceutical Sciences Sontyam Visakhapatnam', 'Visakhapatnam', 'Temporary', 'https://vnips.in/Home.html', 'Pharmacy', 'Affiliated'],
  ['DA', '', 'Sri Sivani College of Pharmacy Chilakapalem, Srikakulam', 'Srikakulam', 'Temporary', 'https://srisivanisscp.com/', 'Pharmacy', 'Affiliated'],
  ['C4', '', 'All Saints PG College Visakhapatnam', 'Visakhapatnam', 'Temporary', 'https://allsaintspgcollege.com/', 'Management', 'Affiliated'],
  ['8M', '', 'Visakha Institute of Management Science Dakamarri Bheemunipatnam', 'Visakhapatnam', 'Temporary', 'http://vimsvizag.com/', 'Management', 'Affiliated'],
  ['Q7', '', 'Avanthi Institute of Engineering and Technology, Bhogapuram', 'Vizianagaram', 'Autonomous', 'http://aietta.ac.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Cherukupally(Village), Near Tagarapuvalasa bridge, Bhogapuram(Mandal)Vizianagaram-531162', '2024'],
  ['34', '', 'GMR Institute of Technology, Rajam', 'Vizianagaram', 'Autonomous', 'http://www.gmrit.org/', 'Engineering', 'Autonomous', false, '2026-27', 'GMR Nagar, Rajam - 532127, Vizianagaram District', '2018-19 to 2027-28'],
  ['KD', '', 'Lendi Institute of Engineering & Technology, Jonnada', 'Vizianagaram', 'Autonomous', 'https://www.lendi.org/', 'Engineering', 'Autonomous', false, '2026-27', 'Jonnada(Vill), Denkada (Mandal), Vizianagaram-535005', '2019'],
  ['33', '', 'Maharaj Vijayaram Gajapathi Raj College of Engineering (MVGR), Chintalavalasa', 'Vizianagaram', 'Autonomous', 'https://www.mvgrce.com/', 'Engineering', 'Autonomous', false, '2026-27', 'Vizianagaram Campus, Chintalavalasa,Vizianagaram - 535005', '2015'],
  ['98', '', 'Raghu Engineering College, Dakamarri', 'Visakhapatnam', 'Autonomous', 'https://raghuenggcollege.com/', 'Engineering', 'Autonomous', false, '2026-27', 'Dakamarri(V),Bheemunipatnam- (M), Visakpatnam District - 531162.', '2017'],
  ['L3', '', 'Vignans Institute of Information Technology, Duvvada', 'Visakhapatnam', 'Autonomous', 'https://vignaniit.edu.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Beside VSEZ, Near Duvvada Railway Station, Kurmannaoalem, Visakhapatnam Dist-530049', '2017'],
  ['NU', '', 'Nadimpalli Satyanarayana Raju Institute of Technology, Sontyam', 'Visakhapatnam', 'Autonomous', 'http://www.nsrit.edu.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Pendurthi Anandapuram Highway,Sontyam, Visakhapatnam-531173', '2020'],
  ['81', '', 'Avanthi Institute of Engineering and Technology, Makavarapalem', 'Anakapalli', 'Autonomous', 'http://avanthienggcollege.ac.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Makavarapalem,Narsipatnam , Anakapalli Dist. - 531113', '2024'],
  ['U4', '', 'Dadi Institute of Engineering & Technology, Anakapalli', 'Anakapalli', 'Autonomous', 'https://www.diet.edu.in/', 'Engineering', 'Autonomous', false, '2026-27', 'NH-16, By pass Road , Anakapalle-531002', '2023'],
  ['A5', '', 'Aditya Institute of Technology and Management, Tekkali', 'Srikakulam', 'Autonomous', 'https://www.adityatekkali.edu.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Tekkali(Mandal), Srikakulam Dist - 532201', '2013'],
  ['6C', '', 'Miracle Educational Society Group of Institutions, Bhogapuram', 'Vizianagaram', 'Autonomous', 'https://miracle.edu.in', 'Engineering', 'Autonomous', false, '2026-27', 'Miracle City, Bhogapuram - 535216, Vizianagaram Dist', '2024'],
  ['NM', '', 'Vignans Institute of Engineering for Women, Kapujaggarajupeta', 'Visakhapatnam', 'Autonomous', 'http://view.edu.in/', 'Engineering', 'Autonomous', false, '2026-27', 'Kapujaggarajupeta, VSEZ Post, Visakhapatnam - 530049', '2023'],
  ['NR', '', 'Baba Institute of Technology and Sciences, Bakkannapalem', 'Visakhapatnam', 'Autonomous', 'http://www.bitsvizag.com/', 'Engineering', 'Autonomous', false, '2026-27', 'PM Palem, Bakkanapalem(V), Madhurawada(Post)- 530048', '2024'],
  ['NT', '', 'Visakha Institute of Engineering & Technology, Narava', 'Visakhapatnam', 'Autonomous', 'http://vietvsp.com/', 'Engineering', 'Autonomous', false, '2026-27', '88th Division, Narava ,Gopalapatnam, Visakhapatnam-530027', '2024'],
  ['W6', '', 'Sri Sivani College of Engineering, Chilakapalem', 'Srikakulam', 'Autonomous', 'http://srisivani.com/', 'Engineering', 'Autonomous', false, '2026-27', 'Chilakapalem(V), Etcherla (M),Srikakulam-532410, Andhra Pradesh', '2025'],
  ['T5', '', 'Avanthi Institute of Pharmaceutical Sciences, Cherukupalli', 'Vizianagaram', 'Autonomous', 'http://avanthipharma.ac.in/', 'Pharmacy', 'Autonomous', false, '2026-27', 'Cherukupalli, Bhogapuram(M) Vizianagaram Dist - 531162', '2025'],
  ['AC', '', 'Vignan Institute of Pharmaceutical Technology, Duvvada', 'Visakhapatnam', 'Autonomous', 'http://viptvizag.in/', 'Pharmacy', 'Autonomous', false, '2026-27', 'BesideVSEZ, Kapujag-garajupeta, Duvvada, Visakhapatnam-530049', '2024'],
  ['GVCEV', 'https://jntugvcev.edu.in/wp-content/uploads/2022/07/logo-min.jpeg', 'JNTU-GV College of Engineering, Vizianagaram', 'Vizianagaram', 'University Constituent', 'https://jntugvcev.edu.in/', 'Engineering', 'University', true, '2026-27', 'Vizianagaram', ''],
  ['GVCPSV', 'https://jntugvcps.edu.in/_next/image?url=%2Flogo512.png&w=256&q=75', 'JNTU-GV College of Pharmaceutical Sciences, Vizianagaram', 'Vizianagaram', 'University Constituent', 'https://jntugvcps.edu.in/', 'Pharmacy', 'University', true, '2026-27', 'Vizianagaram', ''],
  ['GVTCEK', 'https://teck.jntugv.edu.in/images/GV-LOGO.jpeg', 'JNTU-GV Tribal College of Engineering, Kurupam', 'Kurupam', 'University Constituent', 'https://teck.jntugv.edu.in/', 'Engineering', 'University', true, '2026-27', 'Kurupam', ''],
];

const principalOfficeByCode = {
  Q7: ['Dr. B. Murali Krishna', 'pricipal@aietta.ac.in', '79979 03696'],
  34: ['Dr. C.L.V.R.S.V. Prasad', 'prasad.clvrsv@gmrgroup.in', '94414 06014'],
  KD: ['Dr. V.V. Rama Reddy', 'lendi_2008@yahoo.com', '94903 04747'],
  33: ['Dr. YMC.Sekhar', 'principal@mvgrce.edu.in', '9440018657'],
  98: ['Dr. A.Vijay Kumar', 'principal@racollege.com', '9963261138'],
  L3: ['Dr. J. Sudhakar', 'sudhakar.jyo@gmail.com', '90520 66699'],
  NU: ['Dr. S. Sambhu Prasad', 'principal@nsrit.edu.in', '95330 33334'],
  81: ['Dr. C.P.V.N.J. MohanRao', 'Principal_aiet@yahoo.com', '98491 47304'],
  U4: ['Dr. R. Vaikunta Rao', 'Principal@diet.edu.in', '99639 93229'],
  A5: ['Dr. A.S. Srinivasa Rao', 'principal@adityatekkali.edu.in', '94401 21465'],
  '6C': ['Dr. A. Arjuna Rao', 'principal@miracleeducationalsociety.com', '94408 03924'],
  NM: ['Dr. Arundhati', 'viewprincipal@gmail.com', '94419 57596'],
  NR: ['Dr. M.Rajan Babu', 'principal@bitsvizag.com', '9492618186'],
  NT: ['Dr. G.V. Pradeep Varma', 'principal@vietvsp.com', '94402 62833'],
  W6: ['Dr. Yenda Srinivasa Rao', 'principal_w6@yahoo.co.in', '94925 46575'],
  T5: ['Dr. K.Purna Nagasree', 'principalavanthit5@gmail.com', '9398020669'],
  AC: ['Dr. Y. Srinivasa Rao', 'viptvizag@gmail.com', '98663 99928'],
  GVCEV: ['Prof. Kota Chandra Bhushana Rao', 'principal@jntugvcev.edu.in', ''],
  GVCPSV: ['Dr. K. Atchuta Kumar', 'pharmacy@jntugv.edu.in', '8977817999'],
  GVTCEK: ['', 'jntukkurupam@gmail.com', ''],
};

const jnanaBhumiCodeByCode = {
  B6: '23942',
  HQ: '10902',
  99: '19819',
  '8K': '27640',
  L6: '11357',
  '6E': '22775',
  '6F': '22797',
  '6J': '22803',
  MT: '20869',
  PC: '21465',
  V1: '35292',
  HH: '12473',
  B7: '12157',
  PK: '23219',
  DA: '19212',
  C4: '10275',
  '8M': '23606',
};

const ensureColumn = (column, definition, done = () => {}) => {
  con.query(`SHOW COLUMNS FROM affiliated_colleges LIKE ?`, [column], (error, rows) => {
    if (error || rows.length) return done();
    con.query(`ALTER TABLE affiliated_colleges ADD COLUMN ${column} ${definition}`, (alterError) => {
      if (alterError) console.error(`Unable to add affiliated_colleges.${column}:`, alterError.message);
      done();
    });
  });
};

const ensureColumns = (columns, done) => {
  const [current, ...remaining] = columns;
  if (!current) return done();
  ensureColumn(current[0], current[1], () => ensureColumns(remaining, done));
};

const seedAffiliatedColleges = () => {
  const sql = `
    INSERT INTO affiliated_colleges
      (college_code, logo, college_name, district, affiliation_type, college_link, college_type, college_status, promote_to_university, academic_year, college_address, autonomous_year, principal_name, principal_email, principal_phone, jnanabhumi_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      logo = VALUES(logo),
      college_name = VALUES(college_name),
      district = VALUES(district),
      affiliation_type = VALUES(affiliation_type),
      college_link = VALUES(college_link),
      college_type = VALUES(college_type),
      college_status = VALUES(college_status),
      promote_to_university = VALUES(promote_to_university),
      academic_year = VALUES(academic_year),
      college_address = VALUES(college_address),
      autonomous_year = VALUES(autonomous_year),
      principal_name = VALUES(principal_name),
      principal_email = VALUES(principal_email),
      principal_phone = VALUES(principal_phone),
      jnanabhumi_code = VALUES(jnanabhumi_code)
  `;

  affiliatedCollegeSeed.forEach(([code, logo, name, district, affiliationType, website, collegeType, collegeStatus, promoteToUniversity = false, academicYear = '2026-27', address = district, autonomousYear = '']) => {
    const principalOffice = principalOfficeByCode[code] || ['', '', ''];
    const jnanaBhumiCode = jnanaBhumiCodeByCode[code] || '';
    con.query(sql, [code, logo, name, district, affiliationType, website, collegeType, collegeStatus, promoteToUniversity, academicYear, address, autonomousYear, ...principalOffice, jnanaBhumiCode], (error) => {
      if (error) console.warn(`Affiliated college seed failed for ${code}:`, error.message);
    });
  });
};

exports.affiliated_colleges_table = () => {
  try {
    const affClgsSql = `CREATE TABLE IF NOT EXISTS affiliated_colleges(
      id int AUTO_INCREMENT PRIMARY KEY,
      college_code varchar(20) NULL,
      logo varchar(500) NOT NULL DEFAULT '',
      college_name varchar(255) NOT NULL,
      college_address varchar(255) NOT NULL DEFAULT '',
      district varchar(120) NOT NULL DEFAULT '',
      affiliation_type varchar(80) NOT NULL DEFAULT 'Temporary',
      college_type varchar(80) NOT NULL DEFAULT 'Engineering',
      college_status varchar(80) NOT NULL DEFAULT 'Affiliated',
      promote_to_university boolean NOT NULL DEFAULT FALSE,
      academic_year varchar(20) NOT NULL DEFAULT '2026-27',
      autonomous_year varchar(20) NOT NULL DEFAULT '',
      principal_name varchar(180) NOT NULL DEFAULT '',
      principal_email varchar(180) NOT NULL DEFAULT '',
      principal_phone varchar(80) NOT NULL DEFAULT '',
      jnanabhumi_code varchar(40) NOT NULL DEFAULT '',
      college_link varchar(255) NOT NULL DEFAULT '',
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`;

    con.query(affClgsSql, (err) => {
      if (err) {
        console.log(err);
        console.log('Affiliated Colleges Table not Created');
        return;
      }

      ensureColumns(
        [
          ['college_code', 'VARCHAR(20) NULL'],
          ['district', "VARCHAR(120) NOT NULL DEFAULT ''"],
          ['affiliation_type', "VARCHAR(80) NOT NULL DEFAULT 'Temporary'"],
          ['college_type', "VARCHAR(80) NOT NULL DEFAULT 'Engineering'"],
          ['college_status', "VARCHAR(80) NOT NULL DEFAULT 'Affiliated'"],
          ['promote_to_university', 'BOOLEAN NOT NULL DEFAULT FALSE'],
          ['academic_year', "VARCHAR(20) NOT NULL DEFAULT '2026-27'"],
          ['autonomous_year', "VARCHAR(20) NOT NULL DEFAULT ''"],
          ['principal_name', "VARCHAR(180) NOT NULL DEFAULT ''"],
          ['principal_email', "VARCHAR(180) NOT NULL DEFAULT ''"],
          ['principal_phone', "VARCHAR(80) NOT NULL DEFAULT ''"],
          ['jnanabhumi_code', "VARCHAR(40) NOT NULL DEFAULT ''"],
          ['created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
          ['updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
        ],
        () => {
          con.query('ALTER TABLE affiliated_colleges ADD UNIQUE KEY uq_affiliated_college_code (college_code)', (indexError) => {
            if (indexError && indexError.code !== 'ER_DUP_KEYNAME') {
              console.warn('Affiliated college code unique index not added:', indexError.message);
            }
            seedAffiliatedColleges();
          });
        },
      );
    });
  } catch (err) {
    console.log(err + 'Server Unreachable');
  }
};
