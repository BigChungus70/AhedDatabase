package backend.model.enums;

import java.util.List;

public enum DataStatus {
    ok,
    archivedBlacklisted,
    archivedLeft,
    archivedDrawn,
    unreachable,
    priority;

    public static final List<DataStatus> ARCHIVED_STATUSES = List.of(
            archivedBlacklisted,
            archivedLeft,
            archivedDrawn
    );
}
