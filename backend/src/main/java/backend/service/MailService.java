package backend.service;

import backend.model.DTO.IpLocationDTO;
import backend.model.PendingUser;
import backend.model.UnverifiedUser;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.my-mail}")
    private String myEmail;

    @Value("${app.domain-URL}${server.servlet.context-path}")
    private String baseUrl;


    public void sendApprovalRequestEmail(PendingUser pending, UnverifiedUser unverified, IpLocationDTO verificationLocation) {

        String approveUrl = baseUrl + "/auth/pending?token=" + pending.getToken() + "&action=approve";
        String rejectUrl = baseUrl + "/auth/pending?token=" + pending.getToken() + "&action=reject";
        String time = pending.getCreatedAt()
                .atZone(ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        String html = """
            <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
                <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td colspan="2" style="padding: 8px; background-color: #f3f4f6;"><b>معلومات الحساب</b></td></tr>
                    <tr><td style="padding: 8px;"><b>الوقت</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>اسم المستخدم</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>البريد</b></td><td>%s</td></tr>

                    <tr><td colspan="2" style="padding: 8px; background-color: #f3f4f6;"><b>عند التسجيل</b></td></tr>
                    <tr><td style="padding: 8px;"><b>العنوان</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>الدولة</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>المنطقة</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>المدينة</b></td><td>%s</td></tr>

                    <tr><td colspan="2" style="padding: 8px; background-color: #f3f4f6;"><b>عند التحقق</b></td></tr>
                    <tr><td style="padding: 8px;"><b>العنوان</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>الدولة</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>المنطقة</b></td><td>%s</td></tr>
                    <tr><td style="padding: 8px;"><b>المدينة</b></td><td>%s</td></tr>
                </table>
                <div style="margin-top: 30px;">
                    <a href="%s" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">موافقة</a>
                    <a href="%s" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 12px;">رفض</a>
                </div>
            </div>
            """.formatted(
                time, pending.getUsername(), pending.getEmail(),
                unverified.getRegistrationIp(), unverified.getRegistrationCountry(),
                unverified.getRegistrationRegion(), unverified.getRegistrationCity(),
                verificationLocation.query(), verificationLocation.country(),
                verificationLocation.regionName(), verificationLocation.city(),
                approveUrl, rejectUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(myEmail);
            helper.setSubject("طلب حساب جديد - " + pending.getUsername());
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public void sendVerificationEmail(String toEmail, String username, String token) {
        String verifyUrl = baseUrl + "/auth/verify?token=" + token;

        String html = """
            <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px; max-width: 600px; margin: auto;">
                <h2 style="color: #1d4ed8;">تأكيد البريد الإلكتروني</h2>
                <p>مرحباً <b>%s</b>،</p>
                <p>تم استلام طلب إنشاء حساب باسمك. اضغط على الزر أدناه لتأكيد بريدك الإلكتروني.</p>
                <p>هذا الرابط صالح لمدة <b>15 دقيقة</b> فقط.</p>
                <div style="margin-top: 30px;">
                    <a href="%s" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">تأكيد البريد الإلكتروني</a>
                </div>
                <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة.</p>
            </div>
            """.formatted(username, verifyUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("تأكيد البريد الإلكتروني");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }


}