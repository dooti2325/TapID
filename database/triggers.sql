USE tapid;

DELIMITER //

DROP TRIGGER IF EXISTS after_session_start//
CREATE TRIGGER after_session_start
AFTER INSERT ON attendance_sessions
FOR EACH ROW
BEGIN
    UPDATE devices 
    SET status = 'online' 
    WHERE classroom_id = NEW.classroom_id;
END//

DROP TRIGGER IF EXISTS after_session_end//
CREATE TRIGGER after_session_end
AFTER UPDATE ON attendance_sessions
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status = 'active' THEN
        UPDATE devices 
        SET status = 'offline' 
        WHERE classroom_id = NEW.classroom_id;
    END IF;
END//

DELIMITER ;
