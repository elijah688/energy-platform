using System.Text.Json.Serialization;

namespace Shared.Model
{

    public record Generator(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("count")] int Count,
        [property: JsonPropertyName("totalKwhPerType")] decimal TotalKwhPerType
    );

    public record UserGenerators(
        [property: JsonPropertyName("generators")] List<Generator> Generators,
        [property: JsonPropertyName("totalKwh")] decimal TotalKwh
    );


    public record GeneratorType(
        [property: JsonPropertyName("typeKey")] string TypeKey,
        [property: JsonPropertyName("label")] string Label,
        [property: JsonPropertyName("icon")] string Icon,
        [property: JsonPropertyName("productionRateKwh")] decimal ProductionRateKwh
    );
}
