<script>
  export let nim = "22.11.1234";
  export let name = "John Doe";
</script>

<div class="nim-card">
  <h2>{name}</h2>
  <p>{nim}</p>
</div>

<style>
  .nim-card {
    padding: 1rem;
    border: 2px solid #4f46e5;
    border-radius: 12px;
    background-color: #eef2ff;
    text-align: center;
    max-width: 300px;
    margin: 2rem auto;
    font-family: sans-serif;
  }

  .nim-card h2 {
    margin-bottom: 0.5rem;
    color: #3730a3;
  }

  .nim-card p {
    font-size: 1.2rem;
    color: #1e3a8a;
    font-weight: bold;
  }
</style>
