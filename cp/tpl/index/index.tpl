<div id="incp-topbar">
  <div class="incp-topbar-collapse">
    <ul class="incp-nav" id="incp-topbar-siteinfo">
	    <li><img class="incp-topbar-logo" src="/in/cp/~/cp/img/logo-g1s48.png" title="frontend_header_site_logo_url"></li>
      <li class="incp-topbar-brand">SysInner</li>
    </ul>
    <ul class="incp-nav incp-topbar-nav" id="incp-topbar-nav-menus">
      <li><a class="l4i-nav-item" href="#pod/index">Pods</a></li>
      <li><a class="l4i-nav-item" href="#app/index">Applications</a></li>
      <li><a class="l4i-nav-item" href="#ips/index">Packages</a></li>
      <li><a class="l4i-nav-item" href="#res/index">Resources</a></li>
    </ul>
    <ul class="incp-nav incp-nav-right" id="incp-topbar-userbar"></ul>
    <ul class="incp-nav incp-nav-right">
      <li><a class="l4i-nav-item" href="https://github.com/sysinner/insoho/issues" target="_blank">Bug Report</a></li>
      <li><a class="l4i-nav-item" href="#about" onclick="inCp.About()">About</a></li>
      <li><a class="l4i-nav-item" href="/in/ops" id="incp-nav-ops-entry" style="display:none">Management</a></li>
    </ul>
  </div>
</div>
<div id="comp-content" class="">loading</div>

<script id="incp-topbar-user-signed-tpl" type="text/html">

<li class="iam-name">{[=it.display_name]}</li>
<li class="iam-photo" id="incp-topbar-user-signed"><img src="{[=it.photo_url]}"/></li>

<div id="incp-topbar-user-signed-modal" style="display:none;">
  <img class="iam-photo" src="{[=it.photo_url]}">
  <div class="iam-name">{[=it.display_name]}</div>
  <a class="btn btn-default iam-btn" href="{[=it.iam_url]}" target="_blank">Account Center</a>
  <a class="btn btn-default iam-btn" href="/in/cp/auth/sign-out">Sign out</a>
</div>
</script>

<div class="incp-footer">
  <span class="copy">&copy;2017&nbsp;</span>
  <span class="url-info"><a href="http://www.sysinner.com" target="_blank">Sysinner PaaS Engine</a></span>
</div>
