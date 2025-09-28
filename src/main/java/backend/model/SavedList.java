package backend.model;

import backend.model.enums.Campaign;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saved_lists")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private boolean archived;
    private LocalDate createdDate;
    private LocalDateTime lastModified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Campaign campaign;

    @OneToMany(mappedBy = "savedList",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<ListEntry> entries = new ArrayList<>();

}
