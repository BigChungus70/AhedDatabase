package backend.config;

import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegal(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("Message", ex.getMessage()));
    }

    @ExceptionHandler(MailAuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleMailAuth(MailAuthenticationException ex) {
        return ResponseEntity.internalServerError().body(Map.of("Message", "المعذرة لايمكن إنشاء حساب في الوقت الحالي"));
    }

    @ExceptionHandler(MessagingException.class)
    public ResponseEntity<Map<String, String>> handleMessaging(MessagingException ex) {
        return ResponseEntity.internalServerError().body(Map.of("Message", "المعذرة لايمكن إنشاء حساب في الوقت الحالي"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.internalServerError().body(Map.of("Message", "حدث خطأ ما"));
    }
}