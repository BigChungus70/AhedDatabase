/*

****************** UNUSED ---- it was for testing ******************
package backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class GlobalDelayFilter extends OncePerRequestFilter {

    private static final long DELAY_MS = 300; // adjust as needed

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            Thread.sleep(DELAY_MS); // simulate delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        filterChain.doFilter(request, response);
    }
}
*/
