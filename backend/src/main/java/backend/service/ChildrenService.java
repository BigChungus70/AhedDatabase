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
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ChildrenService {
    private final ChildrenRepository childrenRepo;
    private final FamilyRepository familyRepo;



    public void updateChildrenForFamily(String familyCode, List<Children> newChildren) {
        Family family = familyRepo.findByCode(familyCode)
                .orElseThrow(() -> new EntityNotFoundException("Family not found"));


        family.getChildren().clear();


        for (Children c : newChildren) {
            c.setFamily(family);
            family.getChildren().add(c);
        }
    }

    public void addChildrenForFamily(Family family, List<Children> children) {
        for (Children child : children) {
            child.setFamily(family);
            childrenRepo.save(child);
        }
    }
}
