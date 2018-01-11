<div id="incp-app-specset-alert" class="alert alert-danger hide"></div>

<div id="incp-app-specset" class="incp-div-light" style="box-sizing: border-box;">loading</div>
<style>
._table_right_space td {
  padding-left: 0 !important;
  padding-right: 20px !important;
}
._table_right_space td > label {
  font-weight: normal;
}
._table_right_space .input-group {
  width: 260px;
}
#incp-app-specset .btn-sm {
  padding: 3px 10px;
  font-size: 12px;
  line-height: 100%;
}
</style>
<script id="incp-app-specset-tpl" type="text/html">
<div class="card">
  <div class="card-header">{[=it.actionTitle]}</div>
  <div class="card-body">

    {[if (it.spec.meta.id && it.spec.meta.id.length > 0) {]}
    <input type="hidden" name="meta_id" value="{[=it.spec.meta.id]}">
    {[} else {]}
    <div class="l4i-form-group">
      <label>ID</label>
      <p><input name="meta_id" class="form-control form-control-sm" value="{[=it.spec.meta.id]}"></p>
    </div>
    {[}]}

    <div class="l4i-form-group">
      <label>Name</label>
      <p><input name="meta_name" class="form-control form-control-sm" value="{[=it.spec.meta.name]}"></p>
    </div>

    <div class="l4i-form-group">
      <label>Description</label>
      <p><input name="description" class="form-control form-control-sm" value="{[=it.spec.description]}"></p>
    </div>

    <!-- <div class="l4i-form-group">
      <label>Bound Spec Plans (draft)</label>
      <p><input name="draft_bound_plans" class="form-control form-control-sm" value="{[=it.spec.draft_bound_plans]}"></p>
    </div> -->

    <div class="l4i-form-group">
      <label>Depends</label>

      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetDependSelect()">
        <img src="/in/cp/~/open-iconic/svg/plus.svg"> &nbsp; Add Depends on the AppSpec
      </button>

      <div id="incp-app-specset-depls-msg">no depend yet ...</div>
      <div id="incp-app-specset-depls"></div>
    </div>


    <div class="l4i-form-group">
      <label>Packages</label>

      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetPackageSelect()">
        <img src="/in/cp/~/open-iconic/svg/plus.svg"> &nbsp; Add Standard Package
      </button>
      <button class="btn btn-default btn-sm hidden">
        <img src="/in/cp/~/open-iconic/svg/plus.svg"> &nbsp; Add Git Repository
      </button>

      <div id="incp-app-specset-ipmls-msg">no packages yet ...</div>
      <div id="incp-app-specset-ipmls"></div>
    </div>


    <div class="l4i-form-group">
      <label>Executors</label>

      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetExecutorSet()">
        <img src="/in/cp/~/open-iconic/svg/plus.svg"> &nbsp; Create new  Executor
      </button>

      <p id="incp-app-specset-executorls-msg">no executor yet ...</p>
      <div id="incp-app-specset-executorls"></div>
    </div>

    <div class="l4i-form-group">

      <label>Service Ports</label>

      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetServicePortAppend()">
        <img src="/in/cp/~/open-iconic/svg/plus.svg"> &nbsp; Add new Port
      </button>

      <div>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Name (http,https, ...)</th>
              <th>Box Port</th>
              {[? it.spec._host_port_enable]}
              <th>Host Port</th>
              {[?]}
              <th></th>
            <tr>
          </thead>
          <tbody id="incp-app-specset-serviceports">
            {[~it.spec.service_ports :vp]}
            <tr class="incp-app-specset-serviceport-item">
              <td>
                <input name="sp_name" type="text" value="{[=vp.name]}" class="form-control form-control-sm " style="width:200px">
              </td>
              <td>
                <input name="sp_box_port" type="text" value="{[=vp.box_port]}" class="form-control form-control-sm " style="width:200px">
              </td>
              {[? it.spec._host_port_enable]}
              <td>
                <input name="sp_host_port" type="text" value="{[=vp.host_port]}" class="form-control form-control-sm " style="width:200px">
              </td>
              {[?]}
              <td align="right">
                <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetServicePortDel(this)">
                  Delete
                </button>
              </td>
            </tr>
            {[~]}
          </tbody>
        </table>
      </div>
    </div>


    <div class="l4i-form-group">
      <label>Allowed Roles</label>
      <div>
        <span style="margin-right:10px">
          <input type="checkbox" name="" value="0" checked="checked" disabled> Owner
        </span>
        {[~it.spec._roles.items :v]}
        <span style="margin-right:10px">
          {[if (v._checked) {]}
          <input type="checkbox" name="roles" value="{[=v.id]}" checked="checked"> {[=v.name]}
          {[} else {]}
          <input type="checkbox" name="roles" value="{[=v.id]}"> {[=v.name]}
          {[}]}
        </span>
        {[~]}
      </div>
    </div>

    <div class="l4i-form-group">
      <label>Resource Requirements</label>
      <div>
        <table class="_table_right_space">
        <tr>
          <td>
            <label>CPU units (minimum)</label>
            <div class="input-group input-group-sm">
              <input type="text" class="form-control form-control-sm" name="exp_res_cpu_min" value="{[=it.spec.exp_res.cpu_min]}">
              <div class="input-group-append"><div class="input-group-text">m</div></div>
            </div>
          </td>
          <td>
            <label>Memory Size (minimum)</label>
            <div class="input-group input-group-sm">
              <input type="text" class="form-control form-control-sm" name="exp_res_mem_min" value="{[=it.spec.exp_res._mem_min]}">
              <div class="input-group-append"><div class="input-group-text">MB</div></div>
            </div>
          </td>
          <td>
            <label>System Volume Size (minimum)</label>
            <div class="input-group input-group-sm">
              <input type="text" class="form-control form-control-sm" name="exp_res_vol_min" value="{[=it.spec.exp_res._vol_min]}">
              <div class="input-group-append"><div class="input-group-text">GB</div></div>
            </div>
          </td>
        </tr>
        </table>
      </div>
    </div>

    <button class="btn btn-primary" onclick="inCpAppSpec.SetCommit()">
      Save
    </button>

    <button class="btn btn-default" onclick="inCpAppSpec.ListRefresh()" style="margin-left:10px">
      Cancel
    </button>
  </div>
</div>
</script>


<script id="incp-app-specset-depls-tpl" type="text/html">
<table class="table table-hover">
  <thead><tr>
    <th>Spec ID</th>
    <th>Name</th>
    <th>Version</th>
    <th></th>
  </tr></thead>
  <tbody>
  {[~it :v]}
  <tr id="incp-app-specset-depls-id{[=v.id]}">
    <td>{[=v.id]}</td>
    <td>{[=v.name]}</td>
    <td>{[=v.version]}</td>
    <td align="right">
      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetDependRemove('{[=v.id]}')">
        Delete
      </button>
    </td>
  </tr>
  {[~]}
  </tbody>
</table>
</script>


<script id="incp-app-specset-ipmls-tpl" type="text/html">
<table class="table table-hover">
  <thead><tr>
    <th>Name</th>
    <th>Version</th>
    <th>Release</th>
    <th>Dist</th>
    <th>Arch</th>
    <th>Volume</th>
    <th></th>
  </tr></thead>
  <tbody>
  {[~it :v]}
  <tr id="incp-app-specset-ipmls-name{[=v.name]}">
    <td>{[=v.name]}</td>
    <td>{[=v.version]}</td>
    <td>{[=v.release]}</td>
    <td>{[=v.dist]}</td>
    <td>{[=v.arch]}</td>
    <td>/usr/sysinner/{[=v.name]}/{[=v.version]}</td>
    <td align="right">
      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetPackageRemove('{[=v.name]}')">
        Delete
      </button>
    </td>
  </tr>
  {[~]}
  </tbody>
</table>
</script>

<script id="incp-app-specset-executorls-tpl" type="text/html">
{[~it :v]}
<div class="incp-app-specset-gn-box">
  <div class="head">
    <span class="title">{[=v.name]}</span>
    <span class="options">
      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetExecutorSet('{[=v.name]}')">
        Setting
      </button>
      <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetExecutorRemove('{[=v.name]}')">
        Delete
      </button>
    </span>
  </div>
  <div class="body">
    <table width="100%">
      <tr>
        <td width="120">ExecStart</td>
        <td><pre><code class="bash">{[=v.exec_start.trim()]}</code></pre></td>
      </tr>
      <tr>
        <td>ExecStop</td>
        <td><pre><code class="bash">{[=v.exec_stop.trim()]}</code></pre></td>
      </tr>
      <tr>
        <td>Priority</td>
        <td>{[=v.priority]}</td>
      </tr>
      <tr>
        <td>Plan</td>
        <td>
          {[if (v.plan.on_boot) {]}
            On Boot
          {[}]}
          {[if (v.plan.on_tick > 0) {]}
            On Tick {[=v.plan.on_tick]}
          {[}]}
        </tr>
    </table>
  </div>
</div>
{[~]}
</script>

<script id="incp-app-specset-serviceport-tpl" type="text/html">
<tr class="incp-app-specset-serviceport-item">
  <td>
    <input name="sp_name" type="text" value="" class="form-control form-control-sm " placeholder="Port Name" style="width:200px">
  </td>
  <td>
    <input name="sp_box_port" type="text" value="" class="form-control form-control-sm " placeholder="Box Port Number 1 ~ 65535" style="width:200px">
  </td>
  {[? it._host_port_enable]}
  <td>
    <input name="sp_host_port" type="text" value="" class="form-control form-control-sm " placeholder="Host Port Number 1 ~ 1024" style="width:200px">
  </td>
  {[?]}
  <td align="right">
    <button class="btn btn-default btn-sm" onclick="inCpAppSpec.SetServicePortDel(this)">
      Delete
    </button>
  </td>
</tr>
</script>
