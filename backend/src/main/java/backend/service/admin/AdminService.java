package backend.service.admin;

import backend.model.UserAhed;
import backend.model.admin.AdminResponseDTO;
import backend.model.enums.UserRole;
import backend.repository.JWTRepository;
import backend.repository.UserRepository;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepo;
    private final JWTRepository jwtRepo;
    private final PasswordEncoder passwordEncoder;

    public List<AdminResponseDTO> getAccounts() {
        return userRepo.findAllByRoleNot(UserRole.Admin).stream()
                .map(u -> new AdminResponseDTO(u.getId(), u.getUsername(), u.getEmail(),
                        u.getRole(), u.getEnabled(), u.getSlot(), u.getLastAccess()))
                .toList();
    }

    public Map<String, String> createSlotAccount(String username, UserRole role) {
        if (role == UserRole.Admin)
            throw new IllegalArgumentException("لا يمكن إنشاء حساب بصلاحية Admin");
        if (userRepo.findByUsername(username).isPresent())
            throw new IllegalArgumentException("اسم المستخدم غير متاح");

        String rawPassword = generatePassword();

        UserAhed user = new UserAhed();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        user.setSlot(true);
        userRepo.save(user);

        return Map.of(
                "username", username,
                "password", rawPassword,
                "Message", "تم إنشاء الحساب بنجاح"
        );
    }

    public Map<String, String> resetPassword(Long id) {
        UserAhed user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("الحساب غير موجود"));
        if(!user.getSlot()){
            throw new IllegalArgumentException("لا يمكن تغيير كلمة سر حساب ثابت");
        }
        String rawPassword = generatePassword();
        user.setPassword(passwordEncoder.encode(rawPassword));
        jwtRepo.deleteAllByUser(user);

        return Map.of(
                "username", user.getUsername(),
                "password", rawPassword,
                "Message", "تم إعادة تعيين كلمة المرور"
        );
    }

    public AdminResponseDTO renameAccount(Long id, String username) {
        UserAhed user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("الحساب غير موجود"));
        if(!user.getSlot()){
            throw new IllegalArgumentException("لا يمكن تغيير اسم حساب ثابت");
        }
        if (userRepo.findByUsername(username).isPresent())
            throw new IllegalArgumentException("اسم المستخدم غير متاح");

        user.setUsername(username);
        jwtRepo.deleteAllByUser(user);
        return toDTO(user);
    }

    public AdminResponseDTO changeRole(Long id, UserRole role) {
        UserAhed user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("الحساب غير موجود"));
        if (role == UserRole.Admin)
            throw new IllegalArgumentException("لا يمكن تعيين صلاحية Admin");
        if(user.getSlot() && role == UserRole.High){
            throw new IllegalArgumentException("لا يمكن تعيين صلاحية High لحساب متغير");
        }

        user.setRole(role);
        jwtRepo.deleteAllByUser(user);
        return toDTO(user);
    }

    public AdminResponseDTO toggleAccount(Long id) {
        UserAhed user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("الحساب غير موجود"));

        user.setEnabled(!user.getEnabled());
        if (!user.getEnabled())
            jwtRepo.deleteAllByUser(user);
        return toDTO(user);
    }
    public Map<String,String> deleteAccount(Long id) {
        UserAhed user = userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("الحساب غير موجود"));
        if(user.getRole() == UserRole.Admin)
        {
            throw new IllegalArgumentException("لا يمكن حذف حساب Admin");
        }
        jwtRepo.deleteAllByUser(user);
        userRepo.deleteById(user.getId());
        return Map.of("Message","تم حذف الحساب");

    }

    private AdminResponseDTO toDTO(UserAhed user) {
        return new AdminResponseDTO(user.getId(), user.getUsername(), user.getEmail(),
                user.getRole(), user.getEnabled(), user.getSlot(), user.getLastAccess());
    }

    private String generatePassword() {
        String letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String digits = "0123456789";
        String symbols = "!@#$%^&*()";
        String all = letters + digits + symbols;

        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(symbols.charAt(random.nextInt(symbols.length())));

        for (int i = 2; i < 8; i++)
            password.append(all.charAt(random.nextInt(all.length())));

        // shuffle so digit and symbol aren't always first
        List<Character> chars = new ArrayList<>();
        for (char c : password.toString().toCharArray()) chars.add(c);
        Collections.shuffle(chars, random);

        StringBuilder result = new StringBuilder();
        chars.forEach(result::append);
        return result.toString();
    }
}