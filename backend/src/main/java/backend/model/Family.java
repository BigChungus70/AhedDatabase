package backend.model;

import backend.model.DTO.SavedListSummaryDTO;
import backend.model.enums.DataStatus;
import backend.model.enums.FamilyCondition;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Family {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String dataUpdate;    // updated or not and last date
    @Enumerated(EnumType.STRING)
    private DataStatus dataStatus;    // archived or not and the reason
    @Column(columnDefinition = "TEXT")
    private String areaName;      // general area
    @Transient // not persisted, not audited
    private List<String> containingLists = new ArrayList<>();
    private Integer sequence;

    // Family information
    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String code;          // unique family code
    @Column(columnDefinition = "TEXT")
    private String parents;       // names of parents
    @Column(columnDefinition = "TEXT")
    private String address;       // specific address
    @Column(columnDefinition = "TEXT")
    private String mapLink;       // link for the house location on map
    @Column(columnDefinition = "TEXT")
    private String numbers;       // phone numbers
    @Column(columnDefinition = "TEXT")
    private String governate;
    private Integer numberOfFamiliesInHouse;
    private Integer size;         // members counts
    private Integer childrenCount;
    private Integer numberOfVisits;

    // Rating standards
    @Enumerated(EnumType.STRING)
    private FamilyCondition condition;
    @Column(columnDefinition = "TEXT")
    private String providerJob;
    @Column(columnDefinition = "TEXT")
    private String noProviderReason;
    @Column(columnDefinition = "TEXT")
    private String generalHealth;
    @Enumerated(EnumType.STRING)
    private FamilyCondition appliancesAndHouseCondition;
    @Column(columnDefinition = "TEXT")
    private String monthlyIncome;
    @Column(columnDefinition = "TEXT")
    private String providerAbroad;
    @Column(columnDefinition = "TEXT")
    private String rent;
    @Column(columnDefinition = "TEXT")
    private String numberOfResidents;
    @Column(columnDefinition = "TEXT")
    private String debt;
    @Column(columnDefinition = "TEXT")
    private String hasSmokers;
    private String numberOfSmokers;

    // Providing agencies
    @Column(columnDefinition = "TEXT")
    private String commissioner;
    @Column(columnDefinition = "TEXT")
    private String irisPrint;
    @Column(columnDefinition = "TEXT")
    private String unicef;
    @Column(columnDefinition = "TEXT")
    private String coupon;
    @Column(columnDefinition = "TEXT")
    private String otherSupplies;

    // Health Situation
    @Column(columnDefinition = "TEXT")
    private String healthProblems;
    @Column(columnDefinition = "TEXT")
    private String teethProblems;

    // Notes about the Family
    @Column(columnDefinition = "TEXT")
    private String abilityToWork;
    @Column(columnDefinition = "TEXT")
    private String childrenTalentsAndNeeds;
    @Column(columnDefinition = "TEXT")
    private String importantNeeds;
    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    @NotAudited
    // again phantom audition since any change on the family fields will audit all the related children in the children_aud table
    private List<Children> children = new ArrayList<>();
}
