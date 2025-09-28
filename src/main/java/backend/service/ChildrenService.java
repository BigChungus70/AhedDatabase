package backend.service;

import backend.model.Children;
import backend.model.Family;
import backend.repository.ChildrenRepository;
import backend.repository.FamilyRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChildrenService {
    private final ChildrenRepository childrenRepo;
    private final FamilyRepository familyRepo;


    public void updateChildrenForFamily(String familyCode, List<Children> newChildren) {
        childrenRepo.deleteByFamilyCode(familyCode);

        for (Children child : newChildren) {
            child.setFamily(familyRepo.findByCode(familyCode).orElseThrow(() -> new EntityNotFoundException("Family not found"))); // set parent
            childrenRepo.save(child);
        }
    }
    public void addChildrenForFamily(Family family, List<Children> children) {
        for (Children child : children) {
            child.setFamily(family);
            childrenRepo.save(child);
        }
    }
}
