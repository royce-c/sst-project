var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

var app = builder.Build();

// make sure the path matches the gateway path
app.MapGet("/csharp", () =>
{
  return Results.Json(new { message = "Hello C#!" });
});

app.Run();