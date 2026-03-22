package backend.model.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRegisterDTO(
        @NotBlank(message = "يرجى ادخال اسم المستخدم")
        @Size(min = 3, message = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل")
        String username,

        @NotBlank(message = "يرجى ادخال كلمة المرور")
        @Size(min = 8, message = "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        @Pattern.List({
                @Pattern(regexp = ".*\\d.*", message = "كلمة المرور يجب أن تحتوي على رقم"),
                @Pattern(regexp = ".*[a-zA-Z].*", message = "كلمة المرور يجب أن تحتوي على حرف"),
                @Pattern(regexp = ".*[!@#$%^&*()].*", message = "كلمة المرور يجب أن تحتوي على رمز خاص")
        })
        String password,

        @NotBlank(message = "يرجى ادخال البريد الإلكتروني")
        @Email(message = "البريد الإلكتروني غير صالح")
        String email
) {
}
