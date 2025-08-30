def verify_success_html():
    return  """
<html>
  <head>
    <title>Email Verified</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        color: #e0f7f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }
      h1 {
        color: #4ade80; /* teal-green */
        font-size: 1.8rem;
        margin-bottom: 20px;
      }
      p {
        color: #cce7e8;
        font-size: 1rem;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Your email has been verified successfully!</h1>
      <p>Welcome aboard! You can now securely use all features of our platform.</p>
    </div>
  </body>
</html>
"""
def verify_failed_html():
    return """
<html>
  <head>
    <title>Email Verification Failed</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        color: #e0f7f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }
      h1 {
        color: #f87171; /* red for failure */
        font-size: 1.8rem;
        margin-bottom: 20px;
      }
      p {
        color: #cce7e8;
        font-size: 1rem;
      }

    </style>
  </head>
  <body>
    <div class="card">
      <h1>Email Verification Failed</h1>
      <p>Sorry, your verification link is invalid or has expired. Please request a new one to continue.</p>
    </div>
  </body>
</html>
"""