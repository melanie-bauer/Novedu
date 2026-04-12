using Microsoft.Extensions.DependencyInjection;

namespace NoveduBackend.Core.Util;

public static class CoreSetup
{
    public static void ConfigureCore(this IServiceCollection services)
    {
        services.AddSingleton<IClock>(SystemClock.Instance);
        
    }
}
