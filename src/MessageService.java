import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class MessageService {
    public void saveMessage(String user, String message, String filePath) {
        String insertQuery = "INSERT INTO messages (username, message, file_path) VALUES (?, ?, ?)";
        
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = (connection != null) ? connection.prepareStatement(insertQuery) : null) {
            
            if (statement != null) {
                statement.setString(1, user);
                statement.setString(2, message);
                statement.setString(3, filePath.isEmpty() ? null : filePath);
                statement.executeUpdate();
                System.out.println("Message saved successfully!");
            } else {
                System.err.println("Database connection failed. Message not saved.");
            }
        } catch (SQLException e) {
            System.err.println("Error saving message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
