using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NewWebAPIDemo.Models
{
    public class TokenModel
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
