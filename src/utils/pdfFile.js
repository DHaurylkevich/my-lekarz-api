const PDFDocument = require('pdfkit');

function generatePDF(res, data) {
    const { countUser, count } = data;

    const doc = new PDFDocument();

    const filename = `document-${Date.now()}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(22).text('Raport systemowy', { align: 'center' }).moveDown();

    doc.fontSize(16).text('Statystyki uzytkownikow:', { underline: true });
    doc.fontSize(14)
        .text(`- Laczna liczba pacjentow: ${countUser.totalPatient} (${countUser.percentagePatient}%)`)
        .text(`- Laczna liczba klinik: ${countUser.totalClinic} (${countUser.percentageClinics}%)`)
        .text(`- Laczna liczba lekarzy: ${countUser.totalDoctor} (${countUser.percentageDoctors}%)`)
        .text(`- Laczna liczba wizyt: ${countUser.totalAppointment} (${countUser.percentageAppointments}%)`);
    doc.moveDown();

    doc.fontSize(16).text('Srednia ocena lekarzy:', { underline: true });
    count.doctorRatings.forEach((rating, index) => {
        doc.fontSize(14).text(`- Lekarz ${index + 1}: ${rating.rating.toFixed(2)}/5`);
    });
    doc.moveDown();

    doc.fontSize(16).text('Srednia ocena wedlug miast:', { underline: true });
    count.cityRating.forEach(city => {
        doc.fontSize(14).text(`- ${city.city}: ${city.averageRating}/5`);
    });
    doc.moveDown();

    doc.fontSize(16).text('Opinie o klinikach:', { underline: true });
    count.clinicsFeedback.forEach(feedback => {
        doc.fontSize(14).text(`- Ocena: ${feedback.feedbackRating}, Liczba opinii: ${feedback.count}`);
    });
    doc.moveDown();

    doc.fontSize(16).text('Opinie pacjentow:', { underline: true });
    count.patientsFeedback.forEach(feedback => {
        doc.fontSize(14).text(`- Ocena: ${feedback.feedbackRating}, Liczba opinii: ${feedback.count}`);
    });

    doc.end();
};

module.exports = generatePDF;