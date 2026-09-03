'use strict';
const { faker } = require('@faker-js/faker');

// Realistic service names per specialty, so a clinic's catalog makes sense
// (no more "CT SCAN" under Alergolog). Each specialty maps to a pool of
// plausible services; a clinic gets only the specialties its doctors practice.
const SERVICES_BY_SPECIALTY = {
    "Alergolog": ["Allergy Consultation", "Allergy Testing", "Skin Prick Test", "Immunotherapy", "Spirometry", "Desensitization Treatment"],
    "Anestezjolog": ["Anesthesia Consultation", "Pre-operative Assessment", "Epidural Consultation", "Pain Anesthesia"],
    "Angiolog": ["Angiology Consultation", "Doppler Ultrasound", "Vascular Ultrasound", "Varicose Vein Treatment"],
    "Audiolog": ["Hearing Test", "Audiometry", "Tinnitus Consultation", "Hearing Aid Fitting"],
    "Chirurg": ["Surgery Consultation", "General Surgery", "Minor Surgery", "Hernia Repair", "Wound Care", "Abscess Drainage"],
    "Chirurg dziecięcy": ["Pediatric Surgery Consultation", "Pediatric Surgery", "Hernia Repair (child)", "Frenectomy"],
    "Chirurg naczyniowy": ["Vascular Surgery Consultation", "Carotid Surgery", "Varicose Vein Surgery"],
    "Chirurg onkolog": ["Oncologic Surgery Consultation", "Tumor Excision", "Cancer Surgery"],
    "Chirurg plastyczny": ["Plastic Surgery Consultation", "Scar Revision", "Skin Graft", "Cosmetic Surgery"],
    "Chirurg szczękowy": ["Maxillofacial Consultation", "Wisdom Tooth Surgery", "Jaw Surgery"],
    "Chirurg transplantolog": ["Transplant Consultation", "Organ Transplant Follow-up"],
    "Chirurg urazowy": ["Trauma Surgery Consultation", "Fracture Surgery", "Emergency Wound Surgery"],
    "Choroby zakaźne": ["Infectious Disease Consultation", "Travel Medicine", "HIV Testing and Counseling", "STD Testing and Treatment"],
    "Dermatolog": ["Dermatology Consultation", "Skin Examination", "Mole Check", "Dermatoscopy", "Acne Treatment", "Skin Biopsy"],
    "Diabetolog": ["Diabetes Management", "Diabetes Consultation", "Glucose Monitoring", "Insulin Therapy Adjustment"],
    "Endokrynolog": ["Endocrinology Consultation", "Thyroid Ultrasound", "Hormone Testing", "Thyroid Nodule Biopsy"],
    "Epidemiolog": ["Epidemiology Consultation", "Vaccination", "Infection Prevention Advice"],
    "Fizjoterapeuta": ["Physiotherapy", "Physical Therapy", "Manual Therapy", "Rehabilitation Exercises", "Kinesiotherapy", "Massage"],
    "Gastroenterolog": ["Gastroenterology Consultation", "Gastroscopy", "Colonoscopy", "Abdominal Ultrasound", "Helicobacter Pylori Testing"],
    "Genetyk": ["Genetic Consultation", "Genetic Testing", "Genetic Counseling"],
    "Geriatra": ["Geriatric Consultation", "Elderly Care Assessment", "Dementia Screening"],
    "Ginekolog": ["Gynecology Consultation", "Prenatal Care", "Pap Smear", "Gynecological Ultrasound", "Postnatal Care", "Family Planning"],
    "Hematolog": ["Hematology Consultation", "Blood Test", "Bone Marrow Biopsy", "Coagulation Testing"],
    "Hepatolog": ["Hepatology Consultation", "Liver Ultrasound", "Liver Function Testing", "FibroScan"],
    "Internista": ["Internal Medicine Consultation", "General Health Check-up", "Hypertension Management", "ECG", "Blood Test", "Cholesterol Management"],
    "Kardiolog": ["Cardiology Consultation", "ECG", "Echocardiography", "Holter Monitoring", "Stress Test", "Hypertension Management"],
    "Laryngolog": ["ENT Consultation", "Hearing Test", "Endoscopy of the Throat", "Tonsillectomy Consultation", "Tympanometry"],
    "Logopeda": ["Speech Therapy", "Speech Assessment", "Articulation Therapy", "Stuttering Therapy"],
    "Medycyna estetyczna": ["Aesthetic Medicine Consultation", "Botox Injection", "Hyaluronic Acid Filling", "Skin Care Treatment", "Laser Therapy"],
    "Medycyna nuklearna": ["Nuclear Medicine Consultation", "Scintigraphy", "PET Scan"],
    "Medycyna paliatywna": ["Palliative Care Consultation", "Pain Management", "Hospice Care Coordination"],
    "Medycyna rodzinna": ["Family Medicine Consultation", "General Health Check-up", "Vaccination", "Referral Issuance", "Blood Test"],
    "Medycyna sądowa": ["Forensic Medical Examination", "Medical Certification"],
    "Nefrolog": ["Nephrology Consultation", "Kidney Ultrasound", "Renal Function Testing", "Dialysis Consultation"],
    "Neonatolog": ["Neonatology Consultation", "Newborn Examination", "Newborn Screening"],
    "Neurolog": ["Neurology Consultation", "EEG", "Headache Treatment", "Nerve Conduction Study", "Stroke Prevention"],
    "Neurochirurg": ["Neurosurgery Consultation", "Spine Surgery Consultation", "Disc Herniation Surgery"],
    "Okulista": ["Eye Examination", "Vision Test", "Glaucoma Screening", "Cataract Consultation", "Fundus Examination"],
    "Onkolog": ["Oncology Consultation", "Chemotherapy Consultation", "Tumor Biopsy", "Cancer Treatment Planning"],
    "Ortopeda": ["Orthopedic Consultation", "X-ray", "Joint Injection", "Fracture Treatment", "Knee Arthroscopy Consultation"],
    "Patomorfolog": ["Pathology Consultation", "Histopathology Examination", "Cytology Testing"],
    "Pediatra": ["Pediatric Consultation", "Child Health Check-up", "Vaccination", "Growth Assessment", "Pediatric Ultrasound"],
    "Periodontolog": ["Periodontal Examination", "Gum Treatment", "Scaling and Root Planing"],
    "Pielęgniarka": ["Nursing Visit", "Wound Dressing", "Home Care", "Blood Pressure Monitoring", "Injection Administration"],
    "Położna": ["Midwife Visit", "Pregnancy Check-up", "Postnatal Care", "Breastfeeding Support", "Childbirth Classes"],
    "Psychiatra": ["Psychiatry Consultation", "Depression Treatment", "Anxiety Treatment", "Psychiatric Medication Management"],
    "Psycholog": ["Psychology Consultation", "Psychotherapy", "Cognitive Behavioral Therapy", "Stress Management", "Psychological Assessment"],
    "Pulmonolog": ["Pulmonology Consultation", "Spirometry", "Asthma Management", "COPD Management", "Chest X-ray"],
    "Radiolog": ["X-ray", "MRI", "CT SCAN", "Ultrasound", "Mammography"],
    "Reumatolog": ["Rheumatology Consultation", "Joint Ultrasound", "Rheumatoid Arthritis Treatment", "Autoimmune Disease Consultation"],
    "Stomatolog": ["Dental Checkup", "Tooth Extraction", "Cavity Filling", "Teeth Whitening", "Dental X-ray", "Root Canal Treatment"],
    "Toksykolog": ["Toxicology Consultation", "Poisoning Assessment"],
    "Urolog": ["Urology Consultation", "Prostate Examination", "Kidney Ultrasound", "Cystoscopy", "Urological Ultrasound"],
};

const DEFAULT_SERVICES = ["Consultation", "Follow-up Visit", "Diagnostic Examination"];

module.exports = {
    async up(queryInterface, Sequelize) {
        const clinics = await queryInterface.sequelize.query(
            `SELECT id FROM clinics;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const specialties = await queryInterface.sequelize.query(
            `SELECT id, name FROM specialties;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const doctors = await queryInterface.sequelize.query(
            `SELECT DISTINCT clinic_id, specialty_id FROM doctors;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const services = [];
        const specialtyNameById = Object.fromEntries(specialties.map(s => [s.id, s.name]));

        clinics.forEach(clinic => {
            // The clinic offers services only for the specialties its doctors
            // actually practice.
            let clinicSpecialtyIds = [
                ...new Set(doctors.filter(d => d.clinic_id === clinic.id).map(d => d.specialty_id))
            ];

            // Clinics without doctors still get a small realistic catalog.
            if (clinicSpecialtyIds.length === 0) {
                const count = faker.number.int({ min: 1, max: 3 });
                const pool = faker.helpers.shuffle(specialties.map(s => s.id));
                clinicSpecialtyIds = pool.slice(0, count);
            }

            clinicSpecialtyIds.forEach(specialtyId => {
                const specialtyName = specialtyNameById[specialtyId];
                const pool = SERVICES_BY_SPECIALTY[specialtyName] || DEFAULT_SERVICES;
                const numServices = faker.number.int({ min: 2, max: Math.min(pool.length, 4) });
                const selectedNames = faker.helpers.arrayElements(pool, numServices);

                selectedNames.forEach(name => {
                    services.push({
                        name,
                        price: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
                        clinic_id: clinic.id,
                        specialty_id: specialtyId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                });
            });
        });

        await queryInterface.bulkInsert('services', services, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('services', null, {});
    }
};
