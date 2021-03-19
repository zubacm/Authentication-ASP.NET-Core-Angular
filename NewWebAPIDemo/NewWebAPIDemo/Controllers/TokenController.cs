using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NewWebAPIDemo.Models;

namespace NewWebAPIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private UserManager<ApplicationUser> _userManager;
        private readonly ApplicationSettings _appSettings;

        public TokenController(UserManager<ApplicationUser> userManager, IOptions<ApplicationSettings>  appSettings)
        {
            _userManager = userManager;
            _appSettings = appSettings.Value;
        }

        [HttpGet]
        [Route("haj")]
        public string Method()
        {
            return "haj";
        }

        [HttpPost]
        [Route("refresh")]
        public async Task<IActionResult> Refresh(TokenModel tokenModel)
        {
            if (tokenModel is null)
            {
                return BadRequest("Invalid client request");
            }

            string token = tokenModel.Token;
            string refreshToken = tokenModel.RefreshToken;

            var principal = GetPrincipalFromExpiredToken(tokenModel.Token);
            var userId =  principal.Claims.First().Value;

            var user = await _userManager.FindByIdAsync(userId);
            //nema sredjeno vrijeme
            if (user == null || user.RefreshToken != refreshToken /*|| user.RefreshTokenExiryTime <= DateTime.Now*/)
            {
                return BadRequest("Invalid client request");
            }

            var newToken = GenerateAccessToken(principal.Claims);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;

            await _userManager.UpdateAsync(user);

            return new ObjectResult(new
            {
                token = newToken,
                refreshToken = newRefreshToken
            });
        }

        [HttpPost, Authorize]
        [Route("revoke")]
        public async Task<IActionResult> Revoke()
        {
            var username = User.Identity.Name;

            var user = await _userManager.FindByNameAsync(User.FindFirstValue(ClaimTypes.Name));
            if (user == null)
                return BadRequest();

            await _userManager.UpdateAsync(user);

            return NoContent();
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.JWT_Secret));
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false, //you might want to validate the audience and issuer depending on your use case
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = secretKey,
                ValidateLifetime = false
                //ClockSkew = TimeSpan.Zero
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");
            return principal;
        }

        
        private string GenerateAccessToken(IEnumerable<Claim> claims)
        {
            var secretKey =new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_appSettings.JWT_Secret));
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);
            var tokeOptions = new JwtSecurityToken(
                //issuer: "https://localhost:44317",
                //audience: "https://localhost:44317",
                claims: claims,
                expires: DateTime.Now.AddMinutes(5),
                signingCredentials: signinCredentials              
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
            return tokenString;
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }
    }
}