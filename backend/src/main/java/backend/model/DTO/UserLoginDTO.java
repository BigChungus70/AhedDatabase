package backend.model.DTO;

import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank(message = "يرجى ادخال اسم المستخدم")
        String username,

        @NotBlank(message = "يرجى ادخال كلمة المرور")
        String password
) {}