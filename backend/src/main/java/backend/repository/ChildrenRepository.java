package backend.repository;

import backend.model.Children;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildrenRepository extends JpaRepository<Children, Long> {


    @Modifying
    @Transactional
    @Query("DELETE FROM Children c WHERE c.family.code = :familyCode")
    void deleteByFamilyCode(@Param("familyCode") String familyCode);

    @Query("SELECT C FROM Children C WHERE C.family.code = :familyCode")
    List<Children> findByFamilyCode(@Param("familyCode") String familyCode);
}
